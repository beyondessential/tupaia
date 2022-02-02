/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Done, Close, ChevronRight } from '@material-ui/icons';
import { Draggable } from 'react-beautiful-dnd';
import { ALICE_BLUE } from './constant';
import { Tooltip } from '../Tooltip';

const StyledOption = styled.div`
  border-radius: 3px;
  padding: 5px 10px;
  margin: 0 5px;
  height: 64px;
  display: flex;

  min-width: 0;
  flex-grow: 1;
`;

const StyledSelectableOption = styled(StyledOption)`
  & .MuiSvgIcon-root {
    color: #418bbd;
  }
  &.selected {
    background: #f9f9f9;
  }
  &:not(.selected) {
    cursor: pointer;
    & .MuiSvgIcon-root {
      display: none;
    }
  }
  &:hover {
    background: rgba(234, 234, 234, 0.29);
  }
  min-width: 0;
  overflow: hidden;
`;

const StyledSelectableMultipleTimesOption = styled(StyledOption)`
  & .MuiSvgIcon-root {
    color: #418bbd;
  }
  cursor: pointer;
  &:hover {
    background: rgba(234, 234, 234, 0.29);
  }
`;

const StyledSelectedDataCard = styled(StyledOption)`
  .icon-wrapper {
    cursor: pointer;
  }
  background-color: ${props => (props.isDragging ? ALICE_BLUE : 'default')};
`;

const OptionText = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const OptionCode = styled.div`
  font-size: 14px;
  line-height: 140%;
  color: #2c3236;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
`;

const OptionTitle = styled.div`
  font-size: 14px;
  color: white;
  line-height: 140%;
`;

const OptionDescription = styled.div`
  font-size: 12px;
  line-height: 140%;
  color: #5d676c;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const IconWrapper = styled.div`
  align-self: center;
  text-align: right;
  width: 20px;
  & .MuiSvgIcon-root {
    width: 15px;
  }
`;

const OptionTextWithTooltips = ({ option }) => {
  const { code, description } = option;

  return (
    <Tooltip
      title={
        <>
          <OptionTitle>{code}</OptionTitle>
          {description}
        </>
      }
      enterDelay="700"
      enterNextDelay="700"
    >
      <OptionText>
        <OptionCode>{code}</OptionCode>
        <OptionDescription>{description}</OptionDescription>
      </OptionText>
    </Tooltip>
  );
};

export const SelectableOption = ({ option, isSelected, onSelect, ...restProps }) => (
  <StyledSelectableOption
    onClick={onSelect}
    className={isSelected ? 'selected' : ''}
    {...restProps}
  >
    <OptionTextWithTooltips option={option} />
    <IconWrapper>
      <Done />
    </IconWrapper>
  </StyledSelectableOption>
);

export const SelectableMultipleTimesOption = ({ option, onSelect }) => (
  <StyledSelectableMultipleTimesOption onClick={onSelect}>
    <OptionTextWithTooltips option={option} />
    <IconWrapper>
      <ChevronRight />
    </IconWrapper>
  </StyledSelectableMultipleTimesOption>
);

export const SelectedDataCard = ({ option, onRemove, index }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <Draggable draggableId={option.code} index={index}>
      {(provided, snapshot) => (
        <StyledSelectedDataCard
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging || isDragging}
          onMouseOver={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <OptionTextWithTooltips option={option} />
          <IconWrapper onClick={event => onRemove(event, option)} className="icon-wrapper">
            <Close />
          </IconWrapper>
        </StyledSelectedDataCard>
      )}
    </Draggable>
  );
};
