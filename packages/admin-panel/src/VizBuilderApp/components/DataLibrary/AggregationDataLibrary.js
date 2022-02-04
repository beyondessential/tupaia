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
  aggregate.map(({ type, config }) => ({ code: type, type: 'aggregationOption', config }));

const valueToAggregate = value => value.map(({ code, config }) => ({ type: code, config }));

export const AggregationDataLibrary = ({ aggregate, onAggregateChange, onInvalidChange }) => {
  const [inputValue, setInputValue] = useState('');
  const value = aggregateToValue(aggregate);
  const { data: options, isFetching } = useSearchAggregationOptions();

  const onChange = (event, newValue) => onAggregateChange(valueToAggregate(newValue));

  return (
    <DataLibrary
      options={options || []}
      value={value}
      onChange={onChange}
      onRemove={(event, option) => {
        onChange(
          event,
          value.filter(item => option.code !== item.code),
        );
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => (event ? setInputValue(newInputValue) : false)}
      isLoading={isFetching}
      searchPageSize={MAX_RESULTS}
      onMouseEnter={prefetchAggregationOptions}
      optionComponent={(option, onRemove, index, setEdittingOption) => (
        <SelectedOptionWithJsonEditor
          option={option}
          optionMetaData={options && options.find(({ code }) => code === option.code)}
          onRemove={onRemove}
          onChange={newValue => {
            const newSelectedAggregations = Array.from(value);
            newSelectedAggregations[index].config = newValue.config;
            onAggregateChange(valueToAggregate(newSelectedAggregations));
          }}
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
