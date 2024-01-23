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
  display: flex;
  flex: 1;
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
  setIsDragDisabled, // JSON editor configs
  optionMetaData, //
  currentValue, //
  onInvalidChange, // *****************************************
  onChange,
}) => {
  const onValidationError = err => {
    if (err.length > 0) onInvalidChange(err[0].message);
  };

  const Editor = (
    <JsonEditorPanel
      onMouseOver={() => setIsDragDisabled(true)}
      onMouseLeave={() => setIsDragDisabled(false)}
    >
      <JsonEditor
        mainMenuBar={false}
        mode="code"
        onChange={onChange}
        onInvalidChange={onInvalidChange}
        onValidationError={onValidationError}
        schema={optionMetaData?.schema}
        value={currentValue}
      />
    </JsonEditorPanel>
  );

  return (
    <SelectedOption
      basicOption={basicOption}
      editor={Editor}
      onChange={onChange}
      onRemove={onRemove}
      option={option}
      supportsTitleEditing={supportsTitleEditing}
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
