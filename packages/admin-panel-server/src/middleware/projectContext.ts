import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

export const PROJECT_CODE_HEADER = 'x-project-code';

/**
 * Reads the X-Project-Code header sent by the admin panel and attaches the
 * matching project to req.ctx.project so downstream routes can scope their
 * queries by project. Forwarded requests pass the header through to
 * central-server unchanged.
 */
export const attachProjectContext = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const headerValue = req.headers[PROJECT_CODE_HEADER];
  const projectCode = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (!projectCode) {
    return next();
  }
  try {
    const project = await req.models.project.findOne({ code: projectCode });
    if (project) {
      req.ctx.project = { id: project.id, code: project.code };
    } else {
      winston.warn(`Unknown project code in ${PROJECT_CODE_HEADER} header: ${projectCode}`);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
