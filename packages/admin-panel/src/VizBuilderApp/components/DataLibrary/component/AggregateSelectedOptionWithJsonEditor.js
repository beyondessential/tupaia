/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SelectedOptionWithJsonEditor } from './SelectedOptionWithJsonEditor';

export const AggregateSelectedOptionWithJsonEditor = ({
  option,
  onChange,
  onRemove,
  setIsDragDisabled,
  optionMetaData,
  onInvalidChange,
}) => {
  const currentValue = {
    type: option.code,
    config: option.config || {
      dataSourceEntityType: '',
      aggregationEntityType: '',
    },
  };
  const basicOption = {
    ...optionMetaData,
    ...option,
  };

  return (
    <SelectedOptionWithJsonEditor
      option={option}
      basicOption={basicOption}
      onRemove={onRemove}
      setIsDragDisabled={setIsDragDisabled}
      optionMetaData={optionMetaData}
      currentValue={currentValue}
      onInvalidChange={onInvalidChange}
      onChange={onChange}
    />
  );
};

AggregateSelectedOptionWithJsonEditor.defaultProps = { optionMetaData: null };

AggregateSelectedOptionWithJsonEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
    description: PropTypes.string,
  }),
  setIsDragDisabled: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
