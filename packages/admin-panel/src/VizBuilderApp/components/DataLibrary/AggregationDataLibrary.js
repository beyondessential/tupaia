/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DataLibrary } from '@tupaia/ui-components';
import { useSearchAggregationOptions } from '../../api';
import { useDebounce } from '../../../utilities';

const MAX_RESULTS = 10;

// Converts internal value array to Viz config.aggregate data structure
const aggregateToValue = aggregate =>
  aggregate.map(({ type, config }) => ({ code: type, type: 'aggregationOption', config }));

const valueToAggregate = value => value.map(({ code, config }) => ({ type: code, config }));

export const AggregationDataLibrary = ({ aggregate, onAggregateChange }) => {
  const [inputValue, setInputValue] = useState('');
  const debouncedInputValue = useDebounce(inputValue, 200);
  const value = aggregateToValue(aggregate);
  const { data: aggregationOptionSearchResults, isFetching } = useSearchAggregationOptions({
    search: debouncedInputValue,
  });
  const options = inputValue ? aggregationOptionSearchResults : [];

  return (
    <DataLibrary
      options={options}
      value={value}
      onChange={(event, newValue) => onAggregateChange(valueToAggregate(newValue))}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => (event ? setInputValue(newInputValue) : false)}
      isLoading={isFetching}
      searchPageSize={MAX_RESULTS}
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
};
