// Replaces React Router param tokens (e.g. `:projectCode`) in a URL string
// with their live values from `useParams()`. Used wherever we keep the
// router-pattern URL around for matchPath() / route registration but need
// to hand a navigable URL to <Link>, <Navigate>, etc.
export const substituteRouteParams = (target, params) =>
  Object.entries(params).reduce(
    (url, [key, value]) => (value ? url.replaceAll(`:${key}`, value) : url),
    target,
  );
