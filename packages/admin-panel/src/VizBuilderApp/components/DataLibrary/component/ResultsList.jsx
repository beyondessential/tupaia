import React from 'react';
import PropTypes from 'prop-types';
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
            // eslint-disable-next-line no-nested-ternary
            const onSelect = allowAddMultipleTimes
              ? event => onChange(event, [...value, option])
              : isSelected
              ? () => {}
              : event => onChange(event, [...value, option]);

            if (allowAddMultipleTimes) {
              return (
                <SelectableMultipleTimesOption
                  key={option.code}
                  option={option}
                  onSelect={onSelect}
                />
              );
            }
            return (
              <SelectableOption
                key={option.code}
                option={option}
                isSelected={isSelected}
                onSelect={onSelect}
                {...restDefaultOptionProps}
              />
            );
          })
        : null}
    </>
  );
};

ResultsList.propTypes = {
  groupedOptions: PropTypes.array,
  getOptionProps: PropTypes.string.isRequired,
  allowAddMultipleTimes: PropTypes.bool,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  searchPageSize: PropTypes.number,
};

ResultsList.defaultProps = {
  groupedOptions: [],
  allowAddMultipleTimes: false,
  value: [],
  searchPageSize: null,
};
