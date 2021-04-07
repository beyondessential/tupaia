/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Response, NextFunction } from 'express';
import { Route } from '../routes';

type ReqOfRoute<T> = T extends Route<infer Req> ? Req : never;
// type ResOfRoute<T> = T extends Route<any, infer Res> ? Res : never;
export const handleWith = <T extends { handle: () => Promise<void> }>(
  RouteClass: new (req: ReqOfRoute<T>, res: Response, next: NextFunction) => T,
) => (req: ReqOfRoute<T>, res: Response, next: NextFunction) => {
  const route = new RouteClass(req, res, next);
  return route.handle();
};
