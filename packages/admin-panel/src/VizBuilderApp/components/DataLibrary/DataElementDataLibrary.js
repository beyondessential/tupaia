/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import generateId from 'uuid/v1';
import { BaseSelectedOption, DataLibrary } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { useSearchDataSources } from '../../api';
import { useDebounce } from '../../../utilities';

const DATA_TYPES = {
  DATA_ELEMENT: 'Data Elements',
  DATA_GROUP: 'Data Groups',
};

const MAX_RESULTS = 20;

// Converts internal value array to Viz `fetch` data structure
const valueToFetch = value => {
  const newFetch = {};

  const dataElements = value
    .filter(item => item.type === 'dataElement')
    .map(dataElement => dataElement.code);

  const dataGroups = value
    .filter(item => item.type === 'dataGroup')
    .map(dataGroup => dataGroup.code);

  if (dataElements.length > 0) newFetch.dataElements = dataElements;
  if (dataGroups.length > 0) newFetch.dataGroups = dataGroups;

  return newFetch;
};

const fetchToValue = fetch => {
  let newValue = [];

  if (fetch.dataElements) {
    newValue = [
      ...newValue,
      ...fetch.dataElements.map(deCode => ({
        id: generateId(),
        code: deCode,
        type: 'dataElement',
      })),
    ];
  }
  if (fetch.dataGroups) {
    newValue = [
      ...newValue,
      ...fetch.dataGroups.map(dgCode => ({
        id: generateId(),
        code: dgCode,
        type: 'dataGroup',
      })),
    ];
  }

  return newValue;
};

export const DataElementDataLibrary = ({ fetch, onFetchChange }) => {
  const value = fetchToValue(fetch);

  const [dataType, setDataType] = useState(DATA_TYPES.DATA_ELEMENT);

  const [inputValue, setInputValue] = useState('');

  const debouncedInputValue = useDebounce(inputValue, 200);

  const {
    data: dataElementSearchResults = [],
    isFetching: isFetchingDataElements,
  } = useSearchDataSources({
    search: debouncedInputValue,
    type: 'dataElement',
    maxResults: MAX_RESULTS,
  });
  const {
    data: dataGroupSearchResults = [],
    isFetching: isFetchingDataGroups,
  } = useSearchDataSources({
    search: debouncedInputValue,
    type: 'dataGroup',
    maxResults: MAX_RESULTS,
  });

  const options = {
    [DATA_TYPES.DATA_ELEMENT]: inputValue ? dataElementSearchResults : [],
    [DATA_TYPES.DATA_GROUP]: inputValue ? dataGroupSearchResults : [],
  };

  const onChange = (event, newValue) => onFetchChange(valueToFetch(newValue));
  const onRemove = (event, option) => {
    onChange(
      event,
      value.filter(item => option !== item),
    );
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
      isLoading={isFetchingDataElements || isFetchingDataGroups}
      searchPageSize={MAX_RESULTS}
      optionComponent={option => <BaseSelectedOption option={option} onRemove={onRemove} />}
    />
  );
};

DataElementDataLibrary.propTypes = {
  fetch: PropTypes.shape({
    dataElements: PropTypes.arrayOf(PropTypes.string).isRequired,
    dataGroups: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onFetchChange: PropTypes.func.isRequired,
};
