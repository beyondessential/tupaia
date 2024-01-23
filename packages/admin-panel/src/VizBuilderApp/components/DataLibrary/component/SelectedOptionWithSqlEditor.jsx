/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SqlEditor } from '@tupaia/ui-components';
import { SelectedOption } from './SelectedOption';

const SqlEditorPanel = styled.div`
  display: flex;
  flex: 1;
  width: 100%;

  .ace_editor {
    width: 100%;
  }
`;

export const SelectedOptionWithSqlEditor = ({
  option, // **************************************************
  basicOption, // Option panel configs (title, description etc)
  supportsTitleEditing,
  onRemove, // ************************************************
  setIsDragDisabled,
  currentValue,
  onChange,
}) => {
  const onSqlChange = newValue => onChange({ ...currentValue, sql: newValue });

  const Editor = (
    <SqlEditorPanel
      onMouseOver={() => setIsDragDisabled(true)}
      onMouseLeave={() => setIsDragDisabled(false)}
    >
      <SqlEditor
        onChange={onSqlChange}
        placeholder="SELECT * FROM transform_table"
        tables={['transform_table']}
        value={currentValue.sql}
      />
    </SqlEditorPanel>
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

SelectedOptionWithSqlEditor.defaultProps = { supportsTitleEditing: false };

SelectedOptionWithSqlEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  supportsTitleEditing: PropTypes.bool,
  setIsDragDisabled: PropTypes.func.isRequired,
  basicOption: PropTypes.object.isRequired,
  currentValue: PropTypes.object.isRequired,
};
