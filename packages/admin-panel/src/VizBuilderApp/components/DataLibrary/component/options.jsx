import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Done, Close, ChevronRight } from '@material-ui/icons';
import { IconButton as MuiIconButton, Input as MuiInput } from '@material-ui/core';
import { Draggable } from 'react-beautiful-dnd';
import {
  FlexSpaceBetween as MuiFlexSpaceBetween,
  Tooltip as BaseTooltip,
} from '@tupaia/ui-components';
import { ALICE_BLUE } from './constant';
import { ExpandIcon } from '../../ExpandIcon';

const FlexSpaceBetween = styled(MuiFlexSpaceBetween)`
  width: 100%;
`;

const Input = styled(MuiInput)`
  .MuiInputBase-input {
    font-size: 14px;
    padding: 0;
    height: auto;
  }
`;

const StyledOption = styled.div`
  border-radius: 3px;
  padding: 15px 10px;
  margin: 0 5px;
  height: auto;
  display: flex;

  min-width: 0;
  flex-grow: 1;
`;

const StyledSelectableOption = styled(StyledOption)`
  & .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
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
    color: ${({ theme }) => theme.palette.text.primary};
  }
  cursor: pointer;
  &:hover {
    background: rgba(234, 234, 234, 0.29);
  }
`;

const StyledSelectedDataCard = styled(StyledOption)`
  background-color: ${props => (props.isDragging ? ALICE_BLUE : 'default')};
`;

const OptionText = styled.div`
  flex: 1;
  min-width: 0;
  width: 100px;
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

const IconButton = styled(IconWrapper).attrs({ as: MuiIconButton })`
  padding-block: 0.2rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const OptionType = PropTypes.shape({
  id: PropTypes.string,
  code: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
});

const Option = ({ option, onDoubleClick }) => {
  const { code, title, description } = option;
  return (
    <OptionText>
      <OptionCode onDoubleClick={onDoubleClick}>{title || code}</OptionCode>
      <OptionDescription>{description}</OptionDescription>
    </OptionText>
  );
};

Option.propTypes = {
  option: OptionType.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
};

const EditableOption = ({ option, isEditing, setIsEditing, title, setTitle }) => {
  const onDoubleClick = () => {
    setIsEditing(true);
  };
  const handleChange = event => {
    setTitle(event.target.value);
  };

  if (!isEditing) {
    return <Option option={option} onDoubleClick={onDoubleClick} />;
  }

  return (
    <OptionText>
      <OptionCode onDoubleClick={onDoubleClick}>
        <Input value={title} onChange={handleChange} />
      </OptionCode>
      <OptionDescription>{option.description}</OptionDescription>
    </OptionText>
  );
};

EditableOption.propTypes = {
  option: OptionType.isRequired,
  setIsEditing: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

EditableOption.defaultProps = {
  isEditing: false,
};

const Tooltip = ({ option, children }) => {
  return (
    <BaseTooltip
      title={
        <>
          <OptionTitle>{option.title || option.code}</OptionTitle>
          {option.description}
        </>
      }
      enterDelay={700}
      enterNextDelay={700}
    >
      {children}
    </BaseTooltip>
  );
};

Tooltip.propTypes = {
  option: OptionType.isRequired,
  children: PropTypes.node.isRequired,
};

export const BaseSelectedOption = ({ option, onRemove }) => {
  return (
    <Tooltip option={option}>
      <FlexSpaceBetween>
        <Option option={option} />

        <IconButton onClick={event => onRemove(event, option)} title="Remove item">
          <Close />
        </IconButton>
      </FlexSpaceBetween>
    </Tooltip>
  );
};

BaseSelectedOption.propTypes = {
  option: OptionType.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export const EditableSelectedOption = ({ option, onRemove, onTitleChange, onOpenModal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(option.title || option.code);

  const useOutsideAlerter = ref => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = event => {
        if (ref.current && !ref.current.contains(event.target) && isEditing) {
          onTitleChange(title);
          setIsEditing(false);
        }
      };

      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, title, isEditing]); // states need to be dependencies
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const onClickOpenModal = () => {
    onOpenModal(option);
  };

  const onClickRemoveOption = event => {
    onRemove(event, option);
  };

  return (
    <Tooltip option={option}>
      <FlexSpaceBetween ref={wrapperRef}>
        <EditableOption
          option={option}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          title={title}
          setTitle={setTitle}
        />
        {onOpenModal && (
          <IconButton onClick={onClickOpenModal} title="Open editor window">
            <ExpandIcon />
          </IconButton>
        )}
        {onRemove && (
          <IconButton onClick={onClickRemoveOption} title="Remove item">
            <Close />
          </IconButton>
        )}
      </FlexSpaceBetween>
    </Tooltip>
  );
};

EditableSelectedOption.defaultProps = {
  onOpenModal: null,
  onRemove: null,
};

EditableSelectedOption.propTypes = {
  option: OptionType.isRequired,
  onRemove: PropTypes.func,
  onTitleChange: PropTypes.func.isRequired,
  onOpenModal: PropTypes.func,
};

export const SelectableOption = ({ option, isSelected, onSelect, ...restProps }) => (
  <StyledSelectableOption
    onClick={onSelect}
    className={isSelected ? 'selected' : ''}
    {...restProps}
  >
    <Tooltip option={option}>
      <FlexSpaceBetween>
        <Option option={option} />
      </FlexSpaceBetween>
    </Tooltip>
    <IconWrapper>
      <Done />
    </IconWrapper>
  </StyledSelectableOption>
);

SelectableOption.propTypes = {
  option: OptionType.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

SelectableOption.defaultProps = {
  isSelected: false,
};

export const SelectableMultipleTimesOption = ({ option, onSelect }) => (
  <StyledSelectableMultipleTimesOption onClick={onSelect}>
    <Tooltip option={option}>
      <FlexSpaceBetween>
        <Option option={option} />
      </FlexSpaceBetween>
    </Tooltip>
    <IconWrapper>
      <ChevronRight />
    </IconWrapper>
  </StyledSelectableMultipleTimesOption>
);

SelectableMultipleTimesOption.propTypes = {
  option: OptionType.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const SelectedDataCard = ({ option, index, optionComponent }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDragDisabled, setIsDragDisabled] = React.useState(false);

  return (
    <Draggable draggableId={option.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <StyledSelectedDataCard
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging || isDragging}
          onMouseOver={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {optionComponent(option, setIsDragDisabled)}
        </StyledSelectedDataCard>
      )}
    </Draggable>
  );
};

SelectedDataCard.propTypes = {
  option: OptionType.isRequired,
  index: PropTypes.number.isRequired,
  optionComponent: PropTypes.node.isRequired,
};
