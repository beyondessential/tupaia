import { ModelRegistry, TupaiaDatabase, modelClasses } from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly dataElement: modelClasses.DataElement;
  readonly entity: modelClasses.Entity;
  readonly feedItem: modelClasses.FeedItem;
  readonly meditrakSyncQueue: modelClasses.MeditrakSyncQueue;
  readonly user: modelClasses.User;
  readonly question: modelClasses.Question;
  readonly surveyResponse: modelClasses.SurveyResponse;
  readonly answer: modelClasses.Answer;
  readonly survey: modelClasses.Survey;
  readonly surveyScreenComponent: modelClasses.SurveyScreenComponent;
  readonly userEntityPermission: modelClasses.UserEntityPermission;
  readonly facility: modelClasses.Facility;
  readonly permissionGroup: modelClasses.PermissionGroup;
  readonly country: modelClasses.Country;
  readonly geographicalArea: modelClasses.GeographicalArea;
  readonly option: modelClasses.Option;
  readonly optionSet: modelClasses.OptionSet;
  readonly surveyGroup: modelClasses.SurveyGroup;
  readonly surveyScreen: modelClasses.SurveyScreen;
}
