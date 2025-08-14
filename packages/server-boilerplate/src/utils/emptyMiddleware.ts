import { RequestHandler } from 'express';

// Does nothing and skips to the next
export const emptyMiddleware: RequestHandler = (_req, _res, next) => {
  next();
};
