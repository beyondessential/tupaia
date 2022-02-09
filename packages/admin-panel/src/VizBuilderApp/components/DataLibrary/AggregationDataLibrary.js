/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataLibrary } from '@tupaia/ui-components';
import { prefetchAggregationOptions, useSearchAggregationOptions } from '../../api';
import { SelectedOptionWithJsonEditor } from './SelectedOptionWithJsonEditor';

const MAX_RESULTS = 10;

// Converts internal value array to Viz config.aggregate data structure
const aggregateToValue = aggregate =>
  aggregate.map(({ type, config, isDisable }) => ({
    code: type,
    type: 'aggregationOption',
    config,
    isDisable,
  }));

const valueToAggregate = value =>
  value.map(({ code, config, isDisable = false }) => ({ type: code, config, isDisable }));

export const AggregationDataLibrary = ({ aggregate, onAggregateChange, onInvalidChange }) => {
  const [inputValue, setInputValue] = useState('');
  const value = aggregateToValue(aggregate);
  const { data: options, isFetching } = useSearchAggregationOptions();

  const onChange = (event, newValue) => onAggregateChange(valueToAggregate(newValue));
  const onRemove = (event, option) => {
    onChange(
      event,
      value.filter(item => option.code !== item.code),
    );
  };

  return (
    <DataLibrary
      options={options || []}
      value={value}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => (event ? setInputValue(newInputValue) : false)}
      isLoading={isFetching}
      searchPageSize={MAX_RESULTS}
      onMouseEnter={prefetchAggregationOptions}
      optionComponent={(option, index, setEdittingOption) => (
        <SelectedOptionWithJsonEditor
          option={option}
          optionMetaData={options && options.find(({ code }) => code === option.code)}
          onChange={newValue => {
            const newSelectedAggregations = Array.from(value);
            // Rest of configs do not apply
            newSelectedAggregations[index].config = newValue.config;
            newSelectedAggregations[index].isDisable = newValue.isDisable;
            onAggregateChange(valueToAggregate(newSelectedAggregations));
          }}
          onRemove={onRemove}
          setEdittingOption={setEdittingOption}
          onInvalidChange={onInvalidChange}
        />
      )}
    />
  );
};

AggregationDataLibrary.propTypes = {
  aggregate: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        config: PropTypes.object,
      }),
    ),
    PropTypes.string,
  ]).isRequired,
  onAggregateChange: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
