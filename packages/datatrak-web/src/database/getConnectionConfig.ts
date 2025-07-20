import { getEnvVarOrDefault } from '@tupaia/utils';
import { getPGliteInstance } from './getPGliteInstance';

export const getConnectionConfig = () => {
  return {
    pglite: getPGliteInstance(),
  };
  // if (process.env.NODE_ENV === 'production') {
  //   return {
  //     pglite: getPGliteInstance(),
  //   };
  // }

  // return {
  //   connectionString: getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db'),
  // };
};
