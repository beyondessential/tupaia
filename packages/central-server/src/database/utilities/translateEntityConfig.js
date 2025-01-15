/**
 * Convert updated config format:
 *
 * {
 *  createNew: true,
 *  fields: {
 *      parentId: {
 *          questionId: 12312322
 *      }
 *  }
 * }
 *
 *
 * To previous format:
 *
 * {
 *  createNew: true,
 *  parentId: {
 *      questionId: 12312322
 *  }
 * }
 *
 */

const extractFields = newFormatConfig => {
  const extractedFields = {};
  const fieldName = newFormatConfig.createNew ? 'fields' : 'filter';
  Object.entries(newFormatConfig[fieldName]).forEach(([field, value]) => {
    // For fields.type value convert value to array, otherwise assign value
    extractedFields[field] = fieldName === 'fields' && field === 'type' ? [value] : value;
  });
  return extractedFields;
};

export const translateEntityConfig = record => {
  const { entity: newFormatConfig, ...restOfConfig } = JSON.parse(record.config);
  if (!newFormatConfig) {
    return record;
  }
  const oldFormatConfig = { ...newFormatConfig, ...extractFields(newFormatConfig) };

  delete oldFormatConfig.fields;
  delete oldFormatConfig.filter;

  return { ...record, config: JSON.stringify({ ...restOfConfig, entity: oldFormatConfig }) };
};
