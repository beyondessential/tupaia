import { ModelRegistry, modelClasses } from "@tupaia/database";

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: modelClasses.LocalSystemFact;
}
