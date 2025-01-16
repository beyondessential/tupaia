import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import { SelectedDataCard } from './options';

const StyledSelectedDataList = styled.div`
  padding-top: 10px;
`;

export const SelectedDataList = ({ value, optionComponent }) => (
  <Droppable droppableId="droppable list">
    {provided => (
      <StyledSelectedDataList ref={provided.innerRef} {...provided.droppableProps}>
        {value.map((option, index) => (
          <SelectedDataCard
            key={option.id}
            option={option}
            optionComponent={optionComponent}
            index={index}
          />
        ))}
        {provided.placeholder}
      </StyledSelectedDataList>
    )}
  </Droppable>
);

SelectedDataList.propTypes = {
  value: PropTypes.array,
  optionComponent: PropTypes.node,
};

SelectedDataList.defaultProps = {
  value: [],
  optionComponent: null,
};
