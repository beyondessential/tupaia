import { NextFunction, Request, Response } from 'express';

export const PROJECT_CODE_PARAM = 'projectCode';

type Project = { id: string; code: string };
type ProjectRef = { id: string };
type Models = Request['models'];
// The full project model record the middleware already fetched — passed to
// `filter` so a rule can use record methods (e.g. `countries()`) without a
// second round-trip.
type ProjectRecord = NonNullable<Awaited<ReturnType<Models['project']['findOne']>>>;

type ProjectScopeRule = {
  filter: (project: ProjectRecord) => Record<string, unknown> | Promise<Record<string, unknown>>;
  ownership: (
    id: string,
    models: Models,
    project: ProjectRecord,
  ) => Promise<ProjectRef | null>;
  // Required so a new rule can't silently bypass POST scope enforcement by
  // forgetting to define one. Receives the active project so a rule whose
  // create isn't scope-bound (e.g. creating a brand-new project) can opt in by
  // returning it.
  bodyOwnership: (body: unknown, models: Models, project: Project) => Promise<ProjectRef | null>;
};

const projectIdFromBody = (body: unknown): ProjectRef | null => {
  if (!body || typeof body !== 'object') return null;
  const projectId = (body as Record<string, unknown>).project_id;
  return typeof projectId === 'string' ? { id: projectId } : null;
};

// Admin-panel forms post related records by code using dotted keys
// (e.g. `'project.code'`) — same convention `convertFieldsToIds` consumes
// on the central side. Resolve those to a project_id so the active-scope
// check can still run on the POST body.
const projectRefFromBody = async (
  body: unknown,
  models: Models,
): Promise<ProjectRef | null> => {
  const direct = projectIdFromBody(body);
  if (direct) return direct;
  if (!body || typeof body !== 'object') return null;
  const projectCode = (body as Record<string, unknown>)['project.code'];
  if (typeof projectCode !== 'string') return null;
  const project = await models.project.findOne({ code: projectCode });
  return project ? { id: project.id } : null;
};

// Endpoints that consume projectCode themselves rather than having it stripped
// before forwarding: the entity importer reads it for project-scoping.
const PROJECT_CODE_PASSTHROUGH_PATHS = new Set(['import/entities']);

const RULES: Record<string, ProjectScopeRule> = {
  surveys: {
    filter: project => ({ project_id: project.id }),
    ownership: async (id, models) => {
      const survey = await models.survey.findById(id);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
    bodyOwnership: projectRefFromBody,
  },
  entities: {
    // Show the project's own (sub-country) entities plus the shared country
    // entities the project spans. Country entities are structural
    // (project_id IS NULL), so project_id alone would hide them — match them by
    // code instead, scoped to the project's project_country set. World/project
    // entities stay hidden. Wrapped in _and_ so it's a single bracketed group:
    // merging with a caller's filter ANDs it in as a hard boundary rather than
    // letting the OR widen the result set.
    filter: async project => {
      const countries = await project.countries();
      const countryCodes = countries.map(country => (country as unknown as { code: string }).code);
      return {
        _and_: {
          project_id: project.id,
          _or_: { type: 'country', code: countryCodes },
        },
      };
    },
    ownership: async (id, models, project) => {
      const entity = await models.entity.findById(id);
      if (!entity) return null;
      const { project_id: projectId, type, code } = entity as {
        project_id?: string;
        type?: string;
        code?: string;
      };
      if (projectId) return { id: projectId };
      // Country entities are shared (project_id IS NULL) but editable from any
      // project whose project_country set spans them — mirror the list filter
      // and treat the active project as owner so the edit is allowed.
      if (type === 'country') {
        const countries = await project.countries();
        const inScope = countries.some(
          country => (country as unknown as { code: string }).code === code,
        );
        return inScope ? { id: project.id } : null;
      }
      return null;
    },
    bodyOwnership: projectRefFromBody,
  },
  surveyResponses: {
    filter: project => ({ 'survey.project_id': project.id }),
    ownership: async (id, models) => {
      const sr = await models.surveyResponse.findById(id);
      if (!sr?.survey_id) return null;
      const survey = await models.survey.findById(sr.survey_id);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
    bodyOwnership: async (body, models) => {
      if (!body || typeof body !== 'object') return null;
      const surveyId = (body as Record<string, unknown>).survey_id;
      if (typeof surveyId !== 'string') return null;
      const survey = await models.survey.findById(surveyId);
      return survey?.project_id ? { id: survey.project_id } : null;
    },
  },
  projects: {
    // Single-project section shows just the selected project's editable row.
    filter: project => ({ id: project.id }),
    // A project's "owning project" is itself, so edits/deletes are allowed only
    // on the active project's row.
    ownership: async id => ({ id }),
    // Creating a project is a global action, not constrained to the active
    // scope — allow it by treating the active project as the owner.
    bodyOwnership: async (_body, _models, project) => project,
  },
};

const splitPath = (path: string): string[] => {
  const stripped = path.replace(/^\/v\d+\//, '/').replace(/^\/+/, '');
  return stripped.split(/[/?]/).filter(Boolean);
};

const rewriteRequestUrl = (req: Request, url: URL) => {
  // Mutate req.url and req.originalUrl before forwarding. Without mutating originalUrl the merged project filter and
  // stripped projectCode param never reach central-server.
  const rewritten = `${url.pathname}${url.search}`;
  req.url = rewritten;
  req.originalUrl = rewritten;
};

const isMutationOnId = (method: string, segments: string[]) =>
  segments.length >= 2 && (method === 'PUT' || method === 'PATCH' || method === 'DELETE');

export const applyProjectScope = async (req: Request, res: Response, next: NextFunction) => {
  // Use a fixed base — we only read pathname/searchParams from the result, so
  // a client-supplied Host header has no role here.
  const url = new URL(req.originalUrl, 'http://localhost');
  const projectCode = url.searchParams.get(PROJECT_CODE_PARAM);
  const segments = splitPath(url.pathname);
  const resourceKey = segments[0] ?? '';
  const rule = RULES[resourceKey];

  // Strip projectCode before forwarding unless this is an endpoint that consumes it
  if (!PROJECT_CODE_PASSTHROUGH_PATHS.has(segments.join('/'))) {
    url.searchParams.delete(PROJECT_CODE_PARAM);
  }

  // No rule or no project context → forward unchanged. Absent projectCode is
  // an explicit "all-data" view; scoped resources see cross-project data.
  if (!rule || !projectCode) {
    rewriteRequestUrl(req, url);
    return next();
  }

  try {
    const project = await req.models.project.findOne({ code: projectCode });
    if (!project) {
      res.status(400).json({ error: `Unknown project code: ${projectCode}` });
      return undefined;
    }
    const projectCtx: Project = { id: project.id, code: project.code };

    // Only inject the list filter on the bare list endpoint (e.g. `surveys`).
    // Deeper GETs are detail or nested sub-resource fetches (`surveys/{id}`,
    // `surveys/{id}/surveyScreenComponents`) scoped by the {id} in the path —
    // the list filter doesn't belong there, and its column (e.g. project_id)
    // often doesn't exist on the sub-resource's base table.
    if (req.method === 'GET' && segments.length === 1) {
      const existingRaw = url.searchParams.get('filter');
      let existing: Record<string, unknown> = {};
      if (existingRaw) {
        try {
          existing = JSON.parse(existingRaw);
        } catch {
          res.status(400).json({ error: 'Invalid filter JSON' });
          return undefined;
        }
      }
      // Scope filter wins on conflict — must be a hard boundary, not an
      // opt-out the caller can override by supplying their own project_id.
      const merged = { ...existing, ...(await rule.filter(project)) };
      url.searchParams.set('filter', JSON.stringify(merged));
    } else if (isMutationOnId(req.method, segments)) {
      const id = segments[1];
      const owner = await rule.ownership(id, req.models, project);
      if (!owner) {
        res.status(404).json({ error: `${resourceKey}/${id} not found` });
        return undefined;
      }
      if (owner.id !== projectCtx.id) {
        res.status(403).json({
          error: `${resourceKey}/${id} does not belong to the active project`,
        });
        return undefined;
      }
    } else if (req.method === 'POST') {
      // Multipart POSTs (e.g. survey import, which carries the questions .xlsx)
      // aren't body-parsed at this global-middleware layer — no multer has run
      // yet — so req.body is empty and we can't introspect the project. Skip the
      // body-ownership check and forward; the form's project.code still reaches
      // central-server, which creates the record under it, and central enforces
      // permissions. The check remains for JSON POSTs we can actually read.
      // req.is returns the matched type string on a positive match, `false` on
      // mismatch, and `null` when the request has no body — so coerce to a bool:
      // only a genuine multipart match skips; bodyless POSTs still hit the check.
      const isMultipart = Boolean(req.is('multipart/form-data'));
      if (!isMultipart) {
        const owner = await rule.bodyOwnership(req.body, req.models, projectCtx);
        if (!owner) {
          res.status(400).json({
            error: `${resourceKey} body must reference a project in the active scope`,
          });
          return undefined;
        }
        if (owner.id !== projectCtx.id) {
          res.status(403).json({ error: `${resourceKey} body references a different project` });
          return undefined;
        }
      }
    }

    rewriteRequestUrl(req, url);
    return next();
  } catch (error) {
    return next(error);
  }
};
