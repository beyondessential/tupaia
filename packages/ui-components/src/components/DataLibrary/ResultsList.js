/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SelectableMultipleTimesOption, SelectableOption } from './options';

const ResultsInfoRow = styled.div`
  padding: 15px;
  font-size: 12px;
  color: #5d676c;
`;

export const ResultsList = ({
  groupedOptions,
  getOptionProps,
  allowAddMultipleTimes,
  value,
  onChange,
  searchPageSize,
}) => {
  let resultsInfo = '';
  resultsInfo += `${groupedOptions.length}`;
  resultsInfo += `${searchPageSize && groupedOptions.length >= searchPageSize ? '+' : ''}`;
  resultsInfo += ` Result${groupedOptions.length === 1 ? '' : 's'}`;
  return (
    <>
      <ResultsInfoRow>{resultsInfo}</ResultsInfoRow>
      {groupedOptions.length > 0
        ? groupedOptions.map((option, index) => {
            const { onClick: defaultOnClick, ...restDefaultOptionProps } = getOptionProps({
              option,
              index,
            });
            const isSelected =
              value.find(selectedItem => selectedItem.code === option.code) !== undefined;
            const onSelect = allowAddMultipleTimes
              ? event => onChange(event, [...value, option])
              : isSelected
              ? () => {}
              : event => onChange(event, [...value, option]);

            if (allowAddMultipleTimes) {
              return (
                <SelectableMultipleTimesOption key={index} option={option} onSelect={onSelect} />
              );
            } else {
              return (
                <SelectableOption
                  key={index}
                  option={option}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  {...restDefaultOptionProps}
                />
              );
            }
          })
        : null}
    </>
  );
};
