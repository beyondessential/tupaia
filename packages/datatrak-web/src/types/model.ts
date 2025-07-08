import { LocalSystemFactModel, ModelRegistry, OptionSetModel, SurveyModel } from '@tupaia/database';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
  readonly optionSet: OptionSetModel;
  readonly survey: SurveyModel;
}
