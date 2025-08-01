import {
  AnswerModel,
  LocalSystemFactModel,
  ModelRegistry,
  OptionSetModel,
  SurveyModel,
  TombstoneModel,
} from '@tupaia/database';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
  readonly optionSet: OptionSetModel;
  readonly survey: SurveyModel;
  readonly answer: AnswerModel;
  readonly tombstone: TombstoneModel;
}
