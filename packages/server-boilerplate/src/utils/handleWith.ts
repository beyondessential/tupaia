import { NextFunction } from 'express';
import { Route } from '../routes';

type ReqOfRoute<T> = T extends Route<infer Req> ? Req : never;
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ResOfRoute<T> = T extends Route<infer Req, infer Res> ? Res : never;
export const handleWith = <T extends { handle: () => Promise<void> }>(
  RouteClass: new (req: ReqOfRoute<T>, res: ResOfRoute<T>, next: NextFunction) => T,
) => (req: ReqOfRoute<T>, res: ResOfRoute<T>, next: NextFunction) => {
  const route = new RouteClass(req, res, next);
  return route.handle();
};
