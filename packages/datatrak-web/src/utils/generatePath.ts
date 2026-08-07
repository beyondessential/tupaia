import { generatePath as routerGeneratePath, type PathParam } from 'react-router';

/**
 * `generatePath` from react-router requires every param in the path to be supplied, typed
 * `string | null`. Most of our call sites pass `useParams()` straight through, which is typed
 * `string | undefined`. At runtime react-router treats `null` and `undefined` identically, so the
 * params are widened here rather than coerced at each call site.
 */
export const generatePath = <Path extends string>(
  path: Path,
  params: { [Key in PathParam<Path>]?: string | null } = {},
) => routerGeneratePath(path, params as { [Key in PathParam<Path>]: string | null });
