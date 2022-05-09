/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

export const FEED_ITEM_TYPES = ['SurveyResponse', 'markdown'];

class FeedItemType extends DatabaseType {
  static databaseType = TYPES.FEED_ITEM;

  constructor(...args) {
    super(...args);
    // Reformat the creation_date string to include the timezone. By default Knex
    // parses the date as stored in the database with the server timezone then strips
    // out the timezone when producing a string for the creation date.
    this.creation_date = moment(this.creation_date).format('Y-MM-DD HH:mm:ss.SSSZZ');
  }
}

export class FeedItemModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return FeedItemType;
  }
}
