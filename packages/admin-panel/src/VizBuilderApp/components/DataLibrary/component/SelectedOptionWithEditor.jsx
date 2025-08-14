import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import styled from 'styled-components';
import { Checkbox, FlexSpaceBetween } from '@tupaia/ui-components';
import { BaseSelectedOption, EditableSelectedOption } from './options';

const FlexBetweenPanel = styled(FlexSpaceBetween)`
  width: 100%;
`;

const OptionPanelWithEditor = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: auto;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
`;

const DownArrowIconButton = styled(IconButton)`
  display: flex;
  padding: 0.2rem;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  }
`;

export const SelectedOptionWithEditor = ({
  option, // **************************************************
  basicOption, // Option panel configs (title, description etc)
  supportsTitleEditing,
  onRemove, // ************************************************
  onChange,
  children,
  isExpanded,
  onToggleExpanded,
  onOpenModal,
  isModal,
}) => {
  return (
    <OptionPanelWithEditor>
      <FlexBetweenPanel>
        <Checkbox
          checked={!option.isDisabled}
          checkedIcon={<CheckBoxOutlinedIcon />}
          disableRipple
          onChange={() => {
            const newOption = { ...option };
            newOption.isDisabled = !option.isDisabled;
            onChange(newOption);
          }}
          size="small"
        />
        {!isModal && (
          <DownArrowIconButton
            $expanded={isExpanded}
            className="icon-wrapper"
            onClick={onToggleExpanded}
            title={`Open ${basicOption.title || basicOption.code} editor`}
          >
            <DownArrow />
          </DownArrowIconButton>
        )}

        {supportsTitleEditing ? (
          <EditableSelectedOption
            option={basicOption}
            onRemove={onRemove}
            onTitleChange={title => {
              onChange({ ...option, title });
            }}
            onOpenModal={onOpenModal}
          />
        ) : (
          <BaseSelectedOption option={basicOption} onRemove={onRemove} />
        )}
      </FlexBetweenPanel>
      {isExpanded && children}
    </OptionPanelWithEditor>
  );
};

SelectedOptionWithEditor.defaultProps = {
  optionMetaData: null,
  supportsTitleEditing: false,
  isExpanded: false,
  isModal: false,
  onToggleExpanded: null,
  onOpenModal: null,
};

SelectedOptionWithEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  supportsTitleEditing: PropTypes.bool,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
    description: PropTypes.string,
  }),
  basicOption: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool,
  onToggleExpanded: PropTypes.func,
  onOpenModal: PropTypes.func,
  isModal: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
