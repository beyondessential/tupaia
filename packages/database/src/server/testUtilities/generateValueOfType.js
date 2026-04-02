export function generateValueOfType(type, options = {}) {
  switch (type) {
    case 'text':
    case 'character varying': {
      const text = Math.random().toString(36).substring(2); // 0.sdf -> sdf
      return options.maxLength ? text.substring(0, options.maxLength) : text;
    }
    case 'integer':
      return Math.trunc(Math.random() * 1000);
    case 'double precision':
      return Math.random() * 1000;
    case 'boolean':
      return Math.random() >= 0.5;
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
      throw new Error(`${type} is not a supported dummy data type`);
  }
}
