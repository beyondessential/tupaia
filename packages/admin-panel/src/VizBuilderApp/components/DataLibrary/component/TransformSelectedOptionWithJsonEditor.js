/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@tupaia/ui-components/src/components/DataLibrary/Checkbox';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import styled from 'styled-components';
import { BaseSelectedOption, FlexSpaceBetween, JsonEditor } from '@tupaia/ui-components/';

const FlexBetweenPanel = styled(FlexSpaceBetween)`
  width: 100%;
`;

const JsonEditorPanel = styled.div`
  flex: 1;
  display: flex;
  width: 100%;

  > div {
    width: 100%;
  }

  .jsoneditor {
    border: none;
    cursor: text;
  }
`;

const OptionPanelWithJsonEditor = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: flex-start;
  height: auto;
  flex: 1;
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

export const TransformSelectedOptionWithJsonEditor = ({
  option,
  optionMetaData,
  onChange,
  onRemove,
  setEdittingOption,
  onInvalidChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id, code, schema, isDisabled, ...restOfConfig } = option;
  const defaultValueFromSchema =
    schema && Object.fromEntries(Object.keys(schema.properties).map(key => [key, null]));
  const currentValue = {
    ...defaultValueFromSchema,
    transform: code,
    ...restOfConfig,
  };

  return (
    <OptionPanelWithJsonEditor>
      <FlexBetweenPanel>
        <Checkbox
          checkedIcon={<CheckBoxOutlinedIcon />}
          checked={!option.isDisabled}
          onChange={() => {
            const newOption = { ...option };
            newOption.isDisabled = !option.isDisabled;
            onChange(newOption);
          }}
          disableRipple
          size="small"
        />
        <DownArrowIconWrapper
          $expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          className="icon-wrapper"
        >
          <DownArrow />
        </DownArrowIconWrapper>
        <BaseSelectedOption option={option} onRemove={onRemove} />
      </FlexBetweenPanel>
      {isExpanded && (
        <JsonEditorPanel
          onMouseOver={() => setEdittingOption(option.id)}
          onMouseLeave={() => setEdittingOption(null)}
        >
          <JsonEditor
            value={currentValue}
            mode="code"
            mainMenuBar={false}
            onChange={onChange}
            schema={optionMetaData?.schema}
            onInvalidChange={onInvalidChange}
            onValidationError={err => {
              if (err.length > 0) {
                onInvalidChange(err[0].message);
              }
            }}
          />
        </JsonEditorPanel>
      )}
    </OptionPanelWithJsonEditor>
  );
};

TransformSelectedOptionWithJsonEditor.defaultProps = { optionMetaData: null };

TransformSelectedOptionWithJsonEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    schema: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
  }),
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  setEdittingOption: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
