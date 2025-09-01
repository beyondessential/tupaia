import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SqlEditor } from '@tupaia/ui-components';
import { SelectedOptionWithEditor } from './SelectedOptionWithEditor';
import { JsonEditor } from '../../../../widgets';

const EditorPanel = styled.div`
  display: flex;
  flex: 1;
  width: 100%;

  /* Useless div which wraps .jsoneditor but not .sqleditor */
  > div:has(> .jsoneditor) {
    display: contents;
  }

  .jsoneditor {
    border: none;
    cursor: text;
  }

  .ace_editor {
    width: 100%;
  }
`;

export const TransformEditor = ({
  code,
  setIsDragDisabled,
  currentValue,
  onChange,
  optionMetaData,
  onInvalidChange,
  editorRef,
  option,
  basicOption,
  onToggleExpanded,
  isExpanded,
  isModal,
  onRemove,
  onOpenModal,
}) => {
  const onSqlChange = newValue => onChange({ ...currentValue, sql: newValue });

  const setDragDisabledState = state => {
    if (!setIsDragDisabled) return;
    setIsDragDisabled(state);
  };
  return (
    <SelectedOptionWithEditor
      option={option}
      basicOption={basicOption}
      supportsTitleEditing
      onChange={onChange}
      currentValue={currentValue}
      isExpanded={isExpanded}
      onToggleExpanded={onToggleExpanded}
      isModal={isModal}
      onRemove={onRemove}
      onOpenModal={onOpenModal}
    >
      <EditorPanel
        onMouseOver={() => setDragDisabledState(true)}
        onMouseLeave={() => setDragDisabledState(false)}
      >
        {code === 'sql' ? (
          <SqlEditor
            onChange={onSqlChange}
            placeholder="SELECT * FROM transform_table"
            tables={['transform_table']}
            value={currentValue.sql}
          />
        ) : (
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
            editorRef={editorRef}
          />
        )}
      </EditorPanel>
    </SelectedOptionWithEditor>
  );
};

TransformEditor.defaultProps = {
  optionMetaData: null,
  editorRef: null,
  onToggleExpanded: null,
  isExpanded: false,
  isModal: false,
  onOpenModal: null,
  setIsDragDisabled: null,
};

TransformEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    schema: PropTypes.object,
    isDisabled: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
  }),
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  setIsDragDisabled: PropTypes.func,
  onInvalidChange: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
  currentValue: PropTypes.object.isRequired,
  editorRef: PropTypes.object,
  basicOption: PropTypes.object.isRequired,
  onToggleExpanded: PropTypes.func,
  isExpanded: PropTypes.bool,
  isModal: PropTypes.bool,
  onOpenModal: PropTypes.func,
};
