/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SurveyModel as BaseSurveyModel, SurveyRecord as BaseSurveyRecord } from '@tupaia/database';
import { Survey as SurveyFields } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface SurveyModelType extends SurveyFields, Omit<BaseSurveyRecord, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface SurveyModel extends Model<BaseSurveyModel, SurveyFields, SurveyModelType> {}
