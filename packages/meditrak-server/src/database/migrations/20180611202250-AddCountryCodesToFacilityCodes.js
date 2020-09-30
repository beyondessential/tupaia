/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { models } from '../migrate';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async db => {
  const facilities = await models.facility.all();

  return Promise.all(
    facilities.map(async facility => {
      const country = await facility.country();
      facility.code = `${country.code}_${facility.code}`;
      return facility.save();
    }),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
