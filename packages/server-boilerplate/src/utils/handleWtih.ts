/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Response, NextFunction } from 'express';
import { Route } from '../routes';
import { TupaiaRequest } from '../types';

export const handleWith = (RouteClass: typeof Route) => (
  req: TupaiaRequest,
  res: Response,
  next: NextFunction,
) => {
  const route = new RouteClass(req, res, next);
  return route.handle();
};
