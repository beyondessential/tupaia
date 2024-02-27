/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import {
  ConditionType,
  ConditionValue,
  ConditionalPresentationOptions,
  PresentationOptionCondition,
} from '@tupaia/types';
import styled from 'styled-components';
import { MatrixContext } from './MatrixContext';
import { getIsUsingColouredCells } from './utils';
import { Pill } from './Pill';

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-block: 1rem;
  > * {
    :not(:last-child) {
      margin-inline-end: 1rem; // add spacing between the pills
    }
  }
  // at mobile size, display the pills in a column so that they don't overflow the container
  ${({ theme }) => theme.breakpoints.down('xs')} {
    flex-direction: column;
    align-items: flex-start;
    > * {
      :not(:last-child) {
        margin-inline-end: 0;
        margin-block-end: 0.8rem;
      }
    }
  }
`;

const convertNumberRangeToText = (condition: Record<ConditionType, ConditionValue>) => {
  // sort the values so that if we have a range, it's displayed in the correct order
  const sortedValues = Object.values(condition).sort();

  // if there is only one value, return it either as is or with the operator
  if (sortedValues.length === 1) {
    const operator = Object.keys(condition)[0];
    // only display the operator if it's not an equals sign
    if (operator === '=') return sortedValues[0];

    return `${operator} ${sortedValues[0]}`;
  }
  return sortedValues.join(' - ');
};

const convertConditionToText = (condition: PresentationOptionCondition['condition']) => {
  if (typeof condition === 'object') {
    const values = Object.values(condition);

    const isNumberRange = values.every(value => !isNaN(parseInt(String(value), 10)));
    if (isNumberRange) {
      return convertNumberRangeToText(condition);
    }

    return `${values.join(' or ')}`;
  }
  return condition;
};
/**
 * Renders a legend for the matrix, if the matrix is using dots
 */
export const MatrixLegend = () => {
  const { presentationOptions } = useContext(MatrixContext);

  // Only render if the matrix is using dots. Otherwise, return null
  if (!presentationOptions || !getIsUsingColouredCells(presentationOptions)) return null;

  const { conditions } = presentationOptions as ConditionalPresentationOptions;

  const legendConditions = conditions?.filter(condition => !!condition.legendLabel);

  // Only render if there are legend conditions. Otherwise, return null
  if (legendConditions?.length === 0) return null;
  return (
    <Wrapper>
      {legendConditions?.map(({ color, legendLabel, condition }) => {
        const text = convertConditionToText(condition);

        const showTooltip = legendLabel && text !== legendLabel ? true : false;
        return (
          <Pill key={legendLabel} color={color} tooltip={showTooltip ? legendLabel : null}>
            {text}
          </Pill>
        );
      })}
    </Wrapper>
  );
};
