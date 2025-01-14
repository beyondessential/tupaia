import { RequestHandler } from 'express';

// Does nothing and skips to the next
export const emptyMiddleware: RequestHandler = (req, res, next) => {
  next();
};
