import { PGlite } from "@electric-sql/pglite";
import { getEnvVarOrDefault } from "@tupaia/utils";

let pgliteInstance: PGlite | null = null;

export const getPGliteInstance = () => {
  if (!pgliteInstance) {
    const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');
    pgliteInstance = new PGlite(connectionString);
  }
  return pgliteInstance;
};
