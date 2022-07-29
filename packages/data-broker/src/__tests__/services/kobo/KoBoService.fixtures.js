/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const MOCK_DATA_SERVICE_ENTITY = [
  {
    id: 'AAAAAAAAAAAAAAAAAAAAAAAA',
    entity_code: 'TupaiaEntityA',
    config: {
      kobo_id: 'KoBoA',
    },
  },
  {
    id: 'BBBBBBBBBBBBBBBBBBBBBBBB',
    entity_code: 'TupaiaEntityB',
    config: {
      kobo_id: 'KoBoB',
    },
  },
  {
    id: 'CCCCCCCCCCCCCCCCCCCCCCCC',
    entity_code: 'TupaiaEntityC',
    config: {
      kobo_id: 'KoBoC',
    },
  },
];

const MOCK_ENTITY = [
  {
    id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    code: 'TupaiaEntityA',
    name: 'Tupaia Entity A',
  },
  {
    id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
    code: 'TupaiaEntityB',
    name: 'Tupaia Entity B',
  },
];

export const MOCK_DB_DATA = {
  dataServiceEntity: MOCK_DATA_SERVICE_ENTITY,
  entity: MOCK_ENTITY,
};

export const MOCK_KOBO_RESULT = {
  _id: 1234,
  _submission_time: '1954-04-11T01:23:45',
  _submitted_by: 'Kermit',
  entity: 'KoBoA',
  who: 'them',
  what: 'that',
  where: 'there',
  when: 'then',
  why: 'because',
};

export const MOCK_ANSWER_MAP = {
  that: 'those',
  there: 'here',
  then: 'now',
};

export const MOCK_QUESTION_MAP = {
  person: { koboQuestionCode: 'who' },
  thing: { koboQuestionCode: 'what' },
  place: { koboQuestionCode: 'where' },
  time: { koboQuestionCode: 'when' },
  reason: { koboQuestionCode: 'why' },
};

export const MOCK_QUESTION_ANSWER_MAP = {
  person: { koboQuestionCode: 'who', answerMap: MOCK_ANSWER_MAP },
  thing: { koboQuestionCode: 'what', answerMap: MOCK_ANSWER_MAP },
  place: { koboQuestionCode: 'where', answerMap: MOCK_ANSWER_MAP },
  time: { koboQuestionCode: 'when', answerMap: MOCK_ANSWER_MAP },
  reason: { koboQuestionCode: 'why', answerMap: MOCK_ANSWER_MAP },
};

export const MOCK_DATA_SOURCE = {
  config: {
    koboSurveyCode: 'abc',
    internalSurveyCode: 'xyz',
    entityQuestionCode: 'entity',
    questionMapping: MOCK_QUESTION_ANSWER_MAP,
  },
};

export const TRANSLATED_DATA = {
  assessor: 'Kermit',
  dataValues: { person: 'them', place: 'here', reason: 'because', thing: 'those', time: 'now' },
  event: 1234,
  eventDate: '1954-04-11T01:23:45',
  orgUnit: 'TupaiaEntityA',
  orgUnitName: 'Tupaia Entity A',
};
