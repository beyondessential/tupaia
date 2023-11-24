/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

/**
 * @format id
 */
import { Entity, Option } from '../../models';

type Id = string;

type AnswerType = {
  id?: Id;
  type: string;
  body: string | Record<string, unknown>;
  /**
   * @checkIdExists { "table": "question" }
   */
  question_id: string;
};

export interface MeditrakSurveyResponseRequest {
  id?: Id;
  survey_id: Id;
  user_id: Id | null;
  answers: AnswerType[];
  clinic_id?: Id | null;
  entity_id?: Id;
  /**
   * @format iso-date-time
   */
  start_time?: string;
  /**
   * @format iso-date-time
   */
  end_time?: string;
  /**
   * @format iso-date-time
   */
  data_time?: string;
  /**
   * @format iso-date-time
   */
  timestamp?: string;
  approval_status?: string;
  entities_upserted?: Entity[];
  options_created?: Omit<Option, 'id'>[];
  /**
   * @description only used in meditrak-app-server, v1.7.87 to v1.9.110 (inclusive) uses submission_time
   */
  submission_time?: string;
  timezone?: string;
  [key: string]: any;
}
