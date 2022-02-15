/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DataLibrary } from '@tupaia/ui-components';
import LibraryAddCheckOutlinedIcon from '@material-ui/icons/LibraryAddCheckOutlined';
import { prefetchAggregationOptions, useSearchAggregationOptions } from '../../api';
import { SelectedOptionWithJsonEditor } from './component/SelectedOptionWithJsonEditor';
import { Checkbox } from './component/Checkbox';

const ColHeader = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 12px;
  box-shadow: inset 0px -1px 0px #dedee0;
  padding: 15px;
  color: #2c3236;
  background: #e8f6ff;
`;

const MAX_RESULTS = 10;

// Converts internal value array to Viz config.aggregate data structure
const aggregateToValue = aggregate =>
  aggregate.map(({ type, config, isDisabled }) => ({
    code: type,
    type: 'aggregationOption',
    config,
    isDisabled,
  }));

const valueToAggregate = value =>
  value.map(({ code, config, isDisabled = false }) => ({ type: code, config, isDisabled }));

export const AggregationDataLibrary = ({ aggregate, onAggregateChange, onInvalidChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isDisabledAll, setIsDisabledAll] = useState(
    value ? !value.some(option => !option.isDisabled) : false,
  );
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
            newSelectedAggregations[index].isDisabled = newValue.isDisabled;
            onAggregateChange(valueToAggregate(newSelectedAggregations));
          }}
          onRemove={onRemove}
          setEdittingOption={setEdittingOption}
          onInvalidChange={onInvalidChange}
        />
      )}
      headerConfig={{ isDisabledAll, setIsDisabledAll }}
      header={
        <ColHeader>
          <Checkbox
            checkedIcon={<LibraryAddCheckOutlinedIcon />}
            checked={!isDisabledAll}
            onChange={() => {
              const newSelectedAggregations = Array.from(value).map(baseValue => {
                const filteredValue = { ...baseValue };
                filteredValue.isDisabled = !isDisabledAll;
                return filteredValue;
              });
              onAggregateChange(valueToAggregate(newSelectedAggregations));
              setIsDisabledAll(!isDisabledAll);
            }}
            disableRipple
            size="small"
          />
          <div style={{ paddingLeft: '25px' }}>Selected Data</div>
        </ColHeader>
      }
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
