/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataLibrary } from '@tupaia/ui-components';
import { prefetchAggregationOptions, useSearchAggregationOptions } from '../../api';
import { AggregateSelectedOptionWithJsonEditor } from './component';

// Converts internal value array to Viz config.aggregate data structure
const aggregateToValue = aggregate => {
  const value = [];
  let index = 0;
  for (const agg of aggregate) {
    if (typeof agg === 'string') {
      value.push({
        id: `${agg}-${index}`, // id used by drag and drop function
        code: agg,
      });
    } else if (typeof agg === 'object') {
      const { id, type: code, ...restOfConfig } = agg;
      value.push({
        id: id || `${code}-${index}`, // id used by drag and drop function
        code,
        ...restOfConfig,
      });
    }
    index++;
  }
  return value;
};

const valueToAggregate = value =>
  value.map(({ id, code, isDisabled = false, ...restOfConfig }, index) => ({
    id: id || `${code}-${index}`, // option from selectable options does not have id.
    type: code,
    isDisabled,
    ...restOfConfig,
  }));

export const AggregationDataLibrary = ({ aggregate, onAggregateChange, onInvalidChange }) => {
  const [inputValue, setInputValue] = useState('');

  const value = aggregateToValue(aggregate);
  const { data: options, isFetching } = useSearchAggregationOptions();

  const onChange = (event, newValue) => onAggregateChange(valueToAggregate(newValue));

  const onRemove = (event, option) => {
    onChange(
      event,
      value.filter(item => option.id !== item.id),
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
      onMouseEnter={prefetchAggregationOptions}
      optionComponent={(option, setIsDragDisabled) => (
        <AggregateSelectedOptionWithJsonEditor
          option={option}
          optionMetaData={options && options.find(({ code }) => code === option.code)}
          onChange={newValue => {
            const newSelectedAggregations = Array.from(value);
            const index = newSelectedAggregations.findIndex(
              aggregation => aggregation.id === option.id,
            );
            newSelectedAggregations[index] = {
              ...newSelectedAggregations[index],
              ...newValue,
            };
            onAggregateChange(valueToAggregate(newSelectedAggregations));
          }}
          onRemove={onRemove}
          setIsDragDisabled={setIsDragDisabled}
          onInvalidChange={onInvalidChange}
        />
      )}
      allowAddMultipleTimes
      supportsDisableAll
    />
  );
};

AggregationDataLibrary.propTypes = {
  aggregate: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        config: PropTypes.object,
        isDisabled: PropTypes.bool,
      }),
    ),
    PropTypes.string,
  ]).isRequired,
  onAggregateChange: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
