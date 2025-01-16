import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SqlEditor } from '@tupaia/ui-components';
import { SelectedOptionWithEditor } from './SelectedOptionWithEditor';
import { JsonEditor } from '../../../../widgets';
import { TransformModal } from './TransformModal';
import { TransformEditor } from './TransformEditor';

const getDefaultValueByType = type => {
  switch (type) {
    case 'string':
      return '';
    case 'array':
      return [];
    case 'object':
      return {};
    case 'boolean':
      return false;
    default:
      return null;
  }
};

const EditorPanel = styled.div`
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

  .ace_editor {
    width: 100%;
  }
`;

export const TransformSelectedOptionWithEditor = ({
  option,
  optionMetaData,
  onChange,
  onRemove,
  setIsDragDisabled,
  onInvalidChange,
}) => {
  const { id, code, schema, isDisabled, ...restOfConfig } = option;
  const defaultValueFromSchema =
    schema &&
    Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => {
        const type =
          value.type ||
          (value.oneOf && value.oneOf[0].type) ||
          (value.enum && typeof value.enum[0]) ||
          (value.oneOf && typeof value.oneOf[0].enum[0]);
        const defaultValue = value.defaultValue || getDefaultValueByType(type);

        return [key, defaultValue];
      }),
    );
  const currentValue = {
    ...defaultValueFromSchema,
    transform: code,
    ...restOfConfig,
  };
  const basicOption = {
    id: option.id,
    code: option.code,
    title: option.title,
    description: option.description || '',
  };

  const editorRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnlarged, setEnlarged] = useState(false);
  const onOpenModal = () => {
    setEnlarged(true);
  };

  const onCloseModal = () => {
    setEnlarged(false);
    /**
     * This is a workaround for the fact that in the jsoneditor library, when mode is `code`, if we make it listen to changes to the `value` and then set the value, it will refocus and reset the state of the editor, which is annoying for the user. Instead we can assume we only need to update the json editor in the panel if it is expanded when the modal closes. If it is not expanded when the modal closes, the action of expanding it will trigger the values to be set anyway
     */
    if (isExpanded && editorRef.current) {
      editorRef.current.set(currentValue);
    }
  };

  const onToggleExpanded = () => {
    const newIsExpanded = !isExpanded;
    if (!newIsExpanded) {
      // When collapsing, any invalid state is thrown away. To tell our parents
      // this we have to trigger an onChange event
      onChange(option);
    }
    setIsExpanded(newIsExpanded);
  };

  const commonProps = {
    code,
    currentValue,
    onChange,
    optionMetaData,
    onInvalidChange,
    option,
    basicOption,
    supportsTitleEditing: true,
  };

  return (
    <>
      {isEnlarged && (
        <TransformModal onClose={onCloseModal}>
          <TransformEditor {...commonProps} isExpanded isModal />
        </TransformModal>
      )}

      <TransformEditor
        {...commonProps}
        setIsDragDisabled={setIsDragDisabled}
        editorRef={ref => {
          editorRef.current = ref;
        }}
        onRemove={onRemove}
        isExpanded={isExpanded}
        onToggleExpanded={onToggleExpanded}
        onOpenModal={onOpenModal}
      />
    </>
  );
};

TransformSelectedOptionWithEditor.defaultProps = { optionMetaData: null };

TransformSelectedOptionWithEditor.propTypes = {
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
  setIsDragDisabled: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
