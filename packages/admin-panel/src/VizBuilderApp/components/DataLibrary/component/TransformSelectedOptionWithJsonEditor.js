/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SelectedOptionWithJsonEditor } from './SelectedOptionWithJsonEditor';

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
    schema && Object.fromEntries(Object.keys(schema.properties).map(key => [key, null]));
  const currentValue = {
    ...defaultValueFromSchema,
    transform: code,
    ...restOfConfig,
  };
  const basicOption = {
    id: option.id,
    code: option.title || option.code,
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
