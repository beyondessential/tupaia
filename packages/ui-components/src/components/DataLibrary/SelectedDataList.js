/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SelectedDataCard } from './options';
import styled from 'styled-components';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

const StyledSelectedDataList = styled.div`
  padding-top: 10px;
`;

export const SelectedDataList = ({ value, onRemove, OptionComponent }) => (
  <Droppable droppableId="droppable list">
    {provided => (
      <StyledSelectedDataList ref={provided.innerRef} {...provided.droppableProps}>
        {value.map((option, index) => (
          <SelectedDataCard
            key={option.code}
            option={option}
            onRemove={onRemove}
            OptionComponent={OptionComponent}
            index={index}
          />
        ))}
        {provided.placeholder}
      </StyledSelectedDataList>
    )}
  </Droppable>
);
