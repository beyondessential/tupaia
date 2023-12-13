/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';

export class Answer extends RealmObject {
  toJson() {
    return {
      id: this.id,
      type: this.type,
      question_id: this.questionId,
      body: this.body,
    };
  }
}

Answer.schema = {
  name: 'Answer',
  primaryKey: 'id',
  properties: {
    id: 'string',
    type: 'string',
    questionId: 'string',
    body: { type: 'string', default: '' },
  },
};

Answer.construct = () => {
  throw new Error('Syncing in answers not yet supported');
};
