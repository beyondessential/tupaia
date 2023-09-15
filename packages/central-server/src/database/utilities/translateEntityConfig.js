/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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
  Object.entries(newFormatConfig.entity[fieldName]).forEach((field, value) => {
    extractedFields[field] = value;
  });
  return extractedFields;
};

export const translateEntityConfig = record => {
  const { entity: newFormatConfig } = record.config;
  const oldFormatConfig = { ...newFormatConfig, ...extractFields(newFormatConfig) };

  delete oldFormatConfig.fields;
  delete oldFormatConfig.filter;

  return { ...record, config: oldFormatConfig };
};
