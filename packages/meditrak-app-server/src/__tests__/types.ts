/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, modelClasses } from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly dataElement: modelClasses.DataElement;
  readonly entity: modelClasses.Entity;
  readonly feedItem: modelClasses.FeedItem;
  readonly meditrakSyncQueue: modelClasses.MeditrakSyncQueue;
  readonly user: modelClasses.User;
  readonly question: modelClasses.Question;
  readonly surveyResponse: modelClasses.SurveyResponse;
  readonly answer: modelClasses.Answer;
  readonly survey: modelClasses.Survey;
  readonly userEntityPermission: modelClasses.UserEntityPermission;
  readonly facility: modelClasses.Facility;
  readonly permissionGroup: modelClasses.PermissionGroup;
  readonly country: modelClasses.Country;
  readonly geographicalArea: modelClasses.GeographicalArea;
}
