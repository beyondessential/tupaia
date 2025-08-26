import { ModelRegistry } from '@tupaia/database';
import {
  AnswerModel,
  CountryModel,
  EntityModel,
  LocalSystemFactModel,
  OptionSetModel,
  ProjectModel,
  SurveyGroupModel,
  SurveyModel,
  TombstoneModel,
  UserModel,
} from '@tupaia/tsmodels';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly answer: AnswerModel;
  readonly country: CountryModel;
  readonly entity: EntityModel;
  readonly localSystemFact: LocalSystemFactModel;
  readonly optionSet: OptionSetModel;
  readonly project: ProjectModel;
  readonly survey: SurveyModel;
  readonly surveyGroup: SurveyGroupModel;
  readonly tombstone: TombstoneModel;
  readonly user: UserModel;
}
