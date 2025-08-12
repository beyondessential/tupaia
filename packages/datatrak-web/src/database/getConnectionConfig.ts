import { getPGliteInstance } from './getPGliteInstance';

export const getConnectionConfig = () => {
  return {
    pglite: getPGliteInstance(),
  };
};
