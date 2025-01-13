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
  if (defaultValue !== undefined) {
    qualifiedSchema = qualifiedSchema.default(schema.cast(defaultValue)); // This aims to cast date defaultValue from string type to date type
  } else if (required) {
    qualifiedSchema = qualifiedSchema.required();
  }

  return qualifiedSchema;
};

const dataTableParamConfigConfigToYupSchema = (paramConfig: DataTableParameterConfig) => {
  const { type } = paramConfig;
  let schema: yup.AnySchema;
  switch (type) {
    case 'string':
    case 'hierarchy':
    case 'dataGroupCode':
      schema = yup.string();
      break;
    case 'number':
      schema = yup.number();
      break;
    case 'boolean':
      schema = yup.bool();
      break;
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
      break;
    case 'array':
    case 'dataElementCodes':
    case 'organisationUnitCodes':
      schema = yup.array().of(yup.string());
      break;
    default:
      throw new Error(`Missing logic to serialize to yup validator for parameter of type: ${type}`);
  }

  return attachQualifiersToSchema(schema, paramConfig);
};

export const dataTableParamsToYupSchema = (params: DataTableParameter[]): yup.AnyObjectSchema => {
  const schemaShape = Object.fromEntries(
    params.map(({ name, config }) => [name, dataTableParamConfigConfigToYupSchema(config)]),
  );
  return yup.object().shape(schemaShape);
};
