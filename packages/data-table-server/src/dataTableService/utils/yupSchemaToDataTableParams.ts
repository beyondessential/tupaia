/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableParameter, DataTableParameterConfig } from '../types';

interface YupDescription {
  type: string;
  defaultValue?: unknown;
  innerType?: YupDescription;
  oneOf?: unknown[];
  tests?: { name?: string }[];
}

const yupDescriptionToDataTableParam = (description: YupDescription): DataTableParameterConfig => {
  const { type, defaultValue, innerType, oneOf, tests } = description;
  const isRequired = tests && tests.some(({ name }) => name === 'required');
  const paramOfInnerType = innerType ? yupDescriptionToDataTableParam(innerType) : undefined;
  const param: DataTableParameterConfig = {
    type,
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
      config: yupDescriptionToDataTableParam({ type, innerType, oneOf, tests, defaultValue }),
    };
  });
};
