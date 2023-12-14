/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { JsonEditor } from '../../../../widgets';
import { SelectedOption } from './SelectedOption';

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

export const SelectedOptionWithJsonEditor = ({
  option, // **************************************************
  basicOption, // Option panel configs (title, description etc)
  supportsTitleEditing,
  onRemove, // ************************************************
  setIsDragDisabled, // Json editor configs
  optionMetaData, //
  currentValue, //
  onInvalidChange, // *****************************************
  onChange,
}) => {
  const Editor = (
    <JsonEditorPanel
      onMouseOver={() => setIsDragDisabled(true)}
      onMouseLeave={() => setIsDragDisabled(false)}
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
  );

  return (
    <SelectedOption
      option={option}
      basicOption={basicOption}
      supportsTitleEditing={supportsTitleEditing}
      onRemove={onRemove}
      onChange={onChange}
      editor={Editor}
    />
  );
};

SelectedOptionWithJsonEditor.defaultProps = { optionMetaData: null, supportsTitleEditing: false };

SelectedOptionWithJsonEditor.propTypes = {
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
  setIsDragDisabled: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
  basicOption: PropTypes.object.isRequired,
  currentValue: PropTypes.object.isRequired,
};
