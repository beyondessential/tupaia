/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

// N.B. whatever name the model is exported under will be what it is retrieved as from the
// ModelRegistry, e.g. models.answer.findOne() rather than models.AnswerModel.findOne()
export { AnswerModel as answer } from './Answer';
export { CountryModel as country } from './Country';
export { DhisSyncLogModel as dhisSyncLog } from './DhisSyncLog';
export { DhisSyncQueueModel as dhisSyncQueue } from './DhisSyncQueue';
export { FacilityModel as facility } from './Facility';
export { EntityModel as entity } from './Entity';
export { EntityRelationModel as entityRelation } from './EntityRelation';
export { EntityRelationTypeModel as entityRelationType } from './EntityRelationType';
export { FeedItemModel as feedItem } from './FeedItem';
export { GeographicalAreaModel as geographicalArea } from './GeographicalArea';
export { InstallIdModel as installId } from './InstallId';
export { MeditrakSyncQueueModel as meditrakSyncQueue } from './MeditrakSyncQueue';
export { Ms1SyncQueueModel as ms1SyncQueue } from './Ms1SyncQueue';
export { Ms1SyncLogModel as ms1SyncLog } from './Ms1SyncLog';
export { OneTimeLoginModel as oneTimeLogin } from './OneTimeLogin';
export { OptionModel as option } from './Option';
export { OptionSetModel as optionSet } from './OptionSet';
export { PermissionGroupModel as permissionGroup } from './PermissionGroup';
export { QuestionModel as question } from './Question';
export { RefreshTokenModel as refreshToken } from './RefreshToken';
export { SurveyGroupModel as surveyGroup } from './SurveyGroup';
export { SurveyModel as survey } from './Survey';
export { SurveyResponseModel as surveyResponse } from './SurveyResponse';
export { SurveyScreenComponentModel as surveyScreenComponent } from './SurveyScreenComponent';
export { SurveyScreenModel as surveyScreen } from './SurveyScreen';
export { UserCountryPermissionModel as userCountryPermission } from './UserCountryPermission';
export { UserFacilityPermissionModel as userFacilityPermission } from './UserFacilityPermission';
export {
  UserGeographicalAreaPermissionModel as userGeographicalAreaPermission,
} from './UserGeographicalAreaPermission';
export { UserModel as user } from './User';
export { UserRewardModel as userReward } from './UserReward';
export { APIClientModel as apiClient } from './APIClient';
