/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableParameter, DataTableParameterConfig } from '../types';

const attachQualifiersToSchema = (
  schema: yup.AnySchema,
  { defaultValue, oneOf, required }: DataTableParameterConfig,
) => {
  let qualifiedSchema = schema;
  if (oneOf) {
    qualifiedSchema = qualifiedSchema.oneOf(oneOf);
  }
  if (defaultValue) {
    qualifiedSchema = qualifiedSchema.default(schema.cast(defaultValue)); // This aims to cast date defaultValue from string type to date type
  } else if (required) {
    qualifiedSchema = qualifiedSchema.required();
  }

  return qualifiedSchema;
};

const dataTableParamConfigConfigToYupSchema = (paramConfig: DataTableParameterConfig) => {
  const { type, innerType } = paramConfig;
  let schema: yup.AnySchema;
  switch (type) {
    case 'string':
      schema = yup.string();
      return attachQualifiersToSchema(schema, paramConfig);
    case 'date':
      schema = yup.date().transform((value, originalValue) => {
        if (value instanceof Date) {
          return value;
        }
        const newValue = new Date(originalValue);

        if (newValue.toString() === 'Invalid Date') {
          return new Error('Invalid Date');
        }

        return newValue;
      });
      return attachQualifiersToSchema(schema, paramConfig);
    case 'array':
      schema = yup.array();
      if (innerType) {
        const innerValidator = dataTableParamConfigConfigToYupSchema(innerType);
        schema = (schema as yup.ArraySchema<yup.AnySchema>).of(innerValidator);
      }
      return attachQualifiersToSchema(schema, paramConfig);
    default:
      throw new Error(`Missing logic to serialize to yup validator for parameter of type: ${type}`);
  }
};

export const dataTableParamsToYupSchema = (params: DataTableParameter[]): yup.AnyObjectSchema => {
  const schemaShape = Object.fromEntries(
    params.map(({ name, config }) => [name, dataTableParamConfigConfigToYupSchema(config)]),
  );
  return yup.object().shape(schemaShape);
};
