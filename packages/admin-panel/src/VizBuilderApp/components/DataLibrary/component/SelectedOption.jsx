/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

const DownArrowIconWrapper = styled.div`
  display: flex;

  .icon-wrapper {
    cursor: pointer;
  }

  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  }
`;

export const SelectedOption = ({
  option, // **************************************************
  basicOption, // Option panel configs (title, description etc)
  supportsTitleEditing,
  onRemove, // ************************************************
  onChange,
  editor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = newIsExpanded => {
    if (!newIsExpanded) {
      // When collapsing, any invalid state is thrown away. To tell our parents
      // this we have to trigger an onChange event
      onChange(option);
    }
    setIsExpanded(newIsExpanded);
  };

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
        <DownArrowIconWrapper
          $expanded={isExpanded}
          className="icon-wrapper"
          onClick={() => handleToggleExpanded(!isExpanded)}
        >
          <DownArrow />
        </DownArrowIconWrapper>
        {supportsTitleEditing ? (
          <EditableSelectedOption
            option={basicOption}
            onRemove={onRemove}
            onTitleChange={title => {
              onChange({ ...option, title });
            }}
          />
        ) : (
          <BaseSelectedOption option={basicOption} onRemove={onRemove} />
        )}
      </FlexBetweenPanel>
      {isExpanded && editor}
    </OptionPanelWithEditor>
  );
};

SelectedOption.defaultProps = { optionMetaData: null, supportsTitleEditing: false };

SelectedOption.propTypes = {
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
  editor: PropTypes.element.isRequired,
};
