import { NextFunction, Request, Response } from 'express';
import { ServerBoilerplateModelRegistry } from '../../types';

export const logApiRequest =
  (models: ServerBoilerplateModelRegistry, apiName: string, version: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const userId = user?.id;
    const { id: apiRequestLogId } = await models.apiRequestLog.create({
      version,
      api: apiName,
      method: req.method,
      endpoint: req.path,
      query: req.query,
      user_id: userId,
    });
    req.apiRequestLogId = apiRequestLogId;
    next();
  };
