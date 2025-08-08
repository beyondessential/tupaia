import Chance from 'chance';

const chance = new Chance();

export function generateValueOfType(type, options = {}) {
  switch (type) {
    case 'text':
    case 'character varying': {
      return chance.string({ length: options.maxLength });
    }
    case 'integer':
      return chance.integer({ min: 0, max: 1000 });
    case 'double precision':
      return chance.floating({ min: 0, max: 1000 });
    case 'boolean':
      return chance.bool();
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date':
      return new Date();
    case 'json':
    case 'jsonb':
      return {};
    case 'ARRAY':
      return [];
    case 'USER-DEFINED': // used for postgis columns that knex doesn't understand
      return null;
    default:
      throw new UnsupportedDummyDataType(`‘${type}’ is not a supported dummy data type`);
  }
}

class UnsupportedDummyDataType extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedDummyDataType';
  }
}
