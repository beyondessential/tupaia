/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable no-template-curly-in-string */

import * as yup from 'yup';

import { toArray } from '../array';
import { getUniqueEntries } from '../getUniqueEntries';

class InvalidSchemaError extends Error {
  constructor(receivedSchema) {
    super(`${receivedSchema} is not a valid yup schema`);
    this.name = 'InvalidYupSchema';
  }
}

const quote = str => `\`${str}\``;

const validateSchema = schema => {
  if (
    typeof schema?.describe !== 'function' ||
    typeof schema?.isValidSync !== 'function' ||
    !schema.describe().type
  ) {
    throw new InvalidSchemaError(schema);
  }
};

const createTypeError = schemas => {
  const types = toArray(schemas).map(schema => {
    const { type, innerType } = schema.describe();

    if (type === 'array' && innerType?.type) {
      return `${innerType.type}[]`;
    }
    return type;
  });
  const typeDescription = getUniqueEntries(types).join(' | ');

  return `$\{path} must be a ${quote(typeDescription)} type, but the final value was: ${quote(
    '${value}',
  )}.`;
};

const oneOfType = schemaInput => {
  const schemas = schemaInput;
  if (!Array.isArray(schemaInput) || schemaInput.length === 0) {
    throw new Error(
      `yupOneOfType expects a non empty schema array as input, but got ${quote(schemaInput)}.`,
    );
  }
  schemas.forEach(validateSchema);

  return yup.lazy(value => {
    if (value === undefined) {
      // Any type can be used if value is not present
      // Returning a type schema can be useful for chaining other methods (eg `.required()`)
      return schemas[0];
    }

    let matchedSchema = schemas.find(schema => schema.isValidSync(value, { strict: true }));
    if (!matchedSchema) {
      // If no type was matched, we can use any of the expected schemata to throw a type error
      // The error message can be customized to mention all expected types
      [matchedSchema] = schemas;
    }
    return matchedSchema.typeError(createTypeError(schemas));
  });
};

const oneOrArrayOf = schema => {
  validateSchema(schema);
  const typeError = createTypeError([schema, yup.array().of(schema)]);

  return yup.lazy(value =>
    Array.isArray(value)
      ? yup.array().of(schema).typeError(typeError)
      : yup.string().typeError(typeError),
  );
};

const polymorphic = schemaPerType => {
  if (typeof schemaPerType !== 'object' || Object.keys(schemaPerType).length === 0) {
    throw new Error(
      `polymorphic expects a non empty object as input, but got ${quote(
        JSON.stringify(schemaPerType),
      )}.`,
    );
  }

  return yup.lazy(value => {
    const typeSchemas = Object.keys(schemaPerType).map(type => {
      const createType = yup[type];
      if (typeof createType !== 'function') {
        throw new InvalidSchemaError(type);
      }
      return createType();
    });
    oneOfType(typeSchemas).validateSync(value);

    const matchedType = Object.keys(schemaPerType).find(type => yup[type]().isValidSync(value));
    return schemaPerType[matchedType];
  });
};

const testSync = (schema, createError) =>
  yup.mixed().test({
    test: (value, context) => {
      validateSchema(schema);

      try {
        schema.validateSync(value);
      } catch (error) {
        if (error.name === 'ValidationError') {
          const message = createError ? createError({ value, error, context }) : error.message;

          throw new yup.ValidationError(message);
        }
        throw error;
      }

      return true;
    },
  });

export const yupUtils = {
  oneOfType,
  oneOrArrayOf,
  polymorphic,
  testSync,
};

export * as yup from 'yup';
