import { ModelRegistry } from '@tupaia/database';
import {
  AnswerModel,
  LocalSystemFactModel,
  OptionSetModel,
  SurveyModel,
  TombstoneModel,
} from '@tupaia/tsmodels';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
  readonly optionSet: OptionSetModel;
  readonly survey: SurveyModel;
  readonly answer: AnswerModel;
  readonly tombstone: TombstoneModel;
}
