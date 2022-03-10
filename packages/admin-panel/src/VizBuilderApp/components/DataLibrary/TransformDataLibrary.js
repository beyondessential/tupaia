/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import generateId from 'uuid/v1';
import PropTypes from 'prop-types';
import { DataLibrary } from '@tupaia/ui-components';
import { prefetchTransformSchemas, useSearchTransformSchemas } from '../../api';
import { TransformSelectedOptionWithJsonEditor, TransformSelectedOption } from './component';

const DATA_TYPES = {
  TRANSFORM: 'Transforms',
  ALIAS: 'Aliases',
};

const transformToValue = transform =>
  transform.map(({ id, name, transform: code, ...restOfConfig }) => ({
    id: id || generateId(), // transform config in existing report does not have id.
    code,
    ...restOfConfig,
  }));

const valueToTransform = value =>
  value.map(({ id, code, isDisabled = false, ...restOfConfig }) => ({
    id: id || generateId(), // option from selectable options does not have id.
    transform: code,
    isDisabled,
    ...restOfConfig,
  }));

export const TransformDataLibrary = ({ transform, onTransformChange, onInvalidChange }) => {
  const value = transformToValue(transform);

  const [dataType, setDataType] = useState(DATA_TYPES.TRANSFORM);
  const [inputValue, setInputValue] = useState('');

  const { data, isFetching } = useSearchTransformSchemas();
  const options = {
    [DATA_TYPES.TRANSFORM]: data ? data.filter(({ alias }) => !alias) : [],
    [DATA_TYPES.ALIAS]: data ? data.filter(({ alias }) => alias) : [],
  };

  const onChange = (event, newValue) => {
    onTransformChange(valueToTransform(newValue));
  };
  const onRemove = (event, option) => {
    onChange(
      event,
      value.filter(item => option.id !== item.id),
    );
  };
  const onChangeInOption = (newValue, option) => {
    const newSelectedTransforms = Array.from(value);
    const index = newSelectedTransforms.findIndex(
      transformOption => transformOption.id === option.id,
    );
    newSelectedTransforms[index] = { ...newValue, id: option.id };
    onChange(undefined, newSelectedTransforms);
  };

  return (
    <DataLibrary
      options={options}
      dataTypes={Object.values(DATA_TYPES)}
      dataType={dataType}
      onChangeDataType={(event, newValue) => setDataType(newValue)}
      value={value}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => (event ? setInputValue(newInputValue) : false)}
      isLoading={isFetching}
      onMouseEnter={prefetchTransformSchemas}
      optionComponent={(option, setIsDragDisabled) => {
        const optionWithMetaData = {
          ...Object.values(options)
            .flat()
            .find(({ code }) => code === option.code),
        };
        return option.alias ? (
          <TransformSelectedOption
            option={option}
            onChange={newValue => onChangeInOption(newValue, option)}
            onRemove={onRemove}
          />
        ) : (
          <TransformSelectedOptionWithJsonEditor
            option={option}
            optionMetaData={optionWithMetaData}
            onChange={newValue => onChangeInOption(newValue, option)}
            onRemove={onRemove}
            setIsDragDisabled={setIsDragDisabled}
            onInvalidChange={onInvalidChange}
          />
        );
      }}
      allowAddMultipleTimes
      supportsDisableAll
    />
  );
};

TransformDataLibrary.propTypes = {
  transform: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        transform: PropTypes.string.isRequired,
      }),
    ),
    PropTypes.string,
  ]).isRequired,
  onTransformChange: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
