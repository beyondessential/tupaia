import { NextFunction, Request, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { CommonContext } from '../types';
import { extractEntityFieldsFromQuery, extractEntityFieldFromQuery } from './fields';

export const attachCommonEntityContext = async (
  req: Request<{ hierarchyName: string }, any, any, { field?: string; fields?: string }> & {
    ctx: CommonContext;
  },
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { hierarchyName } = req.params;

    // The "hierarchy name" in the URL is the project code — each project has one hierarchy.
    const project = await req.models.project.findOne(
      { code: hierarchyName },
      { columns: ['id'] },
    );
    if (!project) {
      throw new PermissionsError(`No access to requested hierarchy: ${hierarchyName}`);
    }

    req.ctx.projectId = project.id;

    const { fields, field } = req.query;
    req.ctx.fields = extractEntityFieldsFromQuery(fields);
    req.ctx.field = extractEntityFieldFromQuery(field);

    next();
  } catch (error) {
    next(error);
  }
};
