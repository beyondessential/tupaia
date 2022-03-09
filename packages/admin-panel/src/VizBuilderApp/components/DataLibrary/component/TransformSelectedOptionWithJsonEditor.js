/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SelectedOptionWithJsonEditor } from './SelectedOptionWithJsonEditor';

const getDefaultValueByType = type => {
  switch (type) {
    case 'string':
      return '';
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
};

export const TransformSelectedOptionWithJsonEditor = ({
  option,
  optionMetaData,
  onChange,
  onRemove,
  setIsDragDisabled,
  onInvalidChange,
}) => {
  const { id, code, schema, isDisabled, ...restOfConfig } = option;
  const defaultValueFromSchema =
    schema &&
    Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => {
        const type =
          value.type ||
          (value.oneOf && value.oneOf[0].type) ||
          (value.enum && typeof value.enum[0]) ||
          (value.oneOf && typeof value.oneOf[0].enum[0]);
        const defaultValue = getDefaultValueByType(type);

        return [key, defaultValue];
      }),
    );
  const currentValue = {
    ...defaultValueFromSchema,
    transform: code,
    ...restOfConfig,
  };
  const basicOption = {
    id: option.id,
    code: option.code,
    title: option.title,
    description: option.description || '',
  };

  return (
    <SelectedOptionWithJsonEditor
      option={option}
      currentValue={currentValue}
      basicOption={basicOption}
      onChange={onChange}
      onRemove={onRemove}
      setIsDragDisabled={setIsDragDisabled}
      onInvalidChange={onInvalidChange}
      optionMetaData={optionMetaData}
    />
  );
};

TransformSelectedOptionWithJsonEditor.defaultProps = { optionMetaData: null };

TransformSelectedOptionWithJsonEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    schema: PropTypes.object,
    isDisabled: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
  }),
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  setIsDragDisabled: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
