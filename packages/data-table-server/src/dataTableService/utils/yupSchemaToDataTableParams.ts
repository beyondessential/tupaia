import { yup } from '@tupaia/utils';
import { DataTableParameter, DataTableParameterConfig } from '../types';

interface YupDescription {
  type: string;
  defaultValue?: unknown;
  innerType?: YupDescription;
  oneOf?: unknown[];
  tests?: { name?: string }[];
}

const translateType = (type: string, name?: string) => {
  if (!name) {
    return type;
  }

  const builtInParamType: Record<string, string> = {
    hierarchy: 'hierarchy',
    dataElementCodes: 'dataElementCodes',
    dataGroupCode: 'dataGroupCode',
    organisationUnitCodes: 'organisationUnitCodes',
    entityCodes: 'organisationUnitCodes',
  };

  return builtInParamType[name] || type;
};

const yupDescriptionToDataTableParam = (
  description: YupDescription,
  paramName?: string,
): DataTableParameterConfig => {
  const { type, defaultValue, innerType, oneOf, tests } = description;
  const isRequired = tests && tests.some(({ name }) => name === 'required');
  const paramOfInnerType = innerType ? yupDescriptionToDataTableParam(innerType) : undefined;
  const newType = translateType(type, paramName);
  const param: DataTableParameterConfig = {
    type: newType,
  };

  if (defaultValue !== undefined) {
    param.defaultValue = defaultValue;
  }

  if (innerType) {
    param.innerType = paramOfInnerType;
  }

  if (oneOf && oneOf.length > 0) {
    param.oneOf = oneOf;
  }

  if (isRequired) {
    param.required = true;
  }

  return param;
};

export const yupSchemaToDataTableParams = (schema: yup.AnyObjectSchema): DataTableParameter[] => {
  const descriptions = schema.describe().fields;
  return Object.entries(descriptions).map(([name, description]) => {
    const { type } = description;
    const innerType = 'innerType' in description ? description.innerType : undefined;
    const oneOf = 'oneOf' in description ? description.oneOf : undefined;
    const tests = 'tests' in description ? description.tests : undefined;
    const defaultValue = schema.fields[name].getDefault();
    return {
      name,
      config: yupDescriptionToDataTableParam({ type, innerType, oneOf, tests, defaultValue }, name),
    };
  });
};
