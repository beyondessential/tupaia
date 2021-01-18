/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';
import { getTimeZone } from 'react-native-localize';

export class Response extends RealmObject {
  toJson() {
    return {
      id: this.id,
      assessor_name: this.assessorName,
      entity_id: this.entityId,
      clinic_id: this.clinicId,
      start_time: this.startTime,
      end_time: this.endTime,
      submission_time: this.submissionTime,
      survey_id: this.surveyId,
      user_id: this.userId,
      answers: this.answers.map(answer => answer.toJson()),
      entities_created: this.entitiesCreated.map(entity => entity.toJson()),
      options_created: this.optionsCreated.map(option => option.toJson()),
      metadata: this.metadata,
      timezone: getTimeZone(),
    };
  }
}

Response.schema = {
  name: 'Response',
  primaryKey: 'id',
  properties: {
    id: 'string',
    assessorName: 'string',
    clinicId: { type: 'string', optional: true },
    entityId: { type: 'string', optional: true },
    startTime: { type: 'string', default: new Date().toISOString() },
    endTime: { type: 'string', default: new Date().toISOString() },
    submissionTime: 'string',
    surveyId: 'string',
    userId: 'string',
    answers: { type: 'list', objectType: 'Answer' },
    entitiesCreated: { type: 'list', objectType: 'Entity' },
    optionsCreated: { type: 'list', objectType: 'Option' },
    metadata: 'string',
  },
};

Response.construct = () => {
  throw new Error('Syncing in responses not yet supported');
};
