/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import { IconButton } from '@material-ui/core';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import styled from 'styled-components';
import { FlexSpaceBetween, Checkbox } from '@tupaia/ui-components';
import { BaseSelectedOption, EditableSelectedOption } from './options';
import { JsonEditor } from '../../../../widgets';
import { ExpandedSelectedOption } from './ExpandedSelectedOption';

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

const DownArrowIconButton = styled(IconButton)`
  display: flex;
  padding: 0.2rem;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  }
`;

const JsonEditorComponent = ({
  option,
  isModal,
  onChange,
  basicOption,
  supportsTitleEditing,
  onRemove,
  setIsDragDisabled,
  currentValue,
  optionMetaData,
  onInvalidChange,
  onOpenModal,
  toggleExpanded,
  editorRef,
  showJSONEditor,
}) => {
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
          aria-label={basicOption.title || basicOption.code}
          id={basicOption.id}
        />

        {!isModal && (
          <DownArrowIconButton
            title="Open JSON editor"
            $expanded={showJSONEditor}
            onClick={toggleExpanded}
          >
            <DownArrow />
          </DownArrowIconButton>
        )}
        {supportsTitleEditing ? (
          <EditableSelectedOption
            option={basicOption}
            onTitleChange={title => {
              onChange({ ...option, title });
            }}
            onOpenModal={onOpenModal}
            onRemove={onRemove}
          />
        ) : (
          <BaseSelectedOption option={basicOption} onRemove={onRemove} />
        )}
      </FlexBetweenPanel>
      {showJSONEditor && (
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
            editorRef={editorRef}
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

JsonEditorComponent.defaultProps = {
  isModal: false,
  onOpenModal: null,
  showJSONEditor: false,
  toggleExpanded: () => {},
  editorRef: null,
};

JsonEditorComponent.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  supportsTitleEditing: PropTypes.bool.isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
    description: PropTypes.string,
  }).isRequired,
  setIsDragDisabled: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
  basicOption: PropTypes.object.isRequired,
  currentValue: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
  onOpenModal: PropTypes.func,
  showJSONEditor: PropTypes.bool,
  toggleExpanded: PropTypes.func,
  editorRef: PropTypes.object,
};

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
  const editorRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

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

  const handleToggleExpanded = () => {
    const newIsExpanded = !isExpanded;
    if (!newIsExpanded) {
      // When collapsing, any invalid state is thrown away. To tell our parents
      // this we have to trigger an onChange event
      onChange(option);
    }
    setIsExpanded(newIsExpanded);
  };

  return (
    <>
      {/** Add the modal here instead of at the top level, so that we have easy access to all the transformed data and therefore the ability to update the title, deselect, etc. */}
      {enlarged && (
        <ExpandedSelectedOption onClose={onCloseModal}>
          <JsonEditorComponent
            option={option}
            isModal
            onChange={onChange}
            basicOption={basicOption}
            supportsTitleEditing={supportsTitleEditing}
            setIsDragDisabled={setIsDragDisabled}
            currentValue={currentValue}
            optionMetaData={optionMetaData}
            onInvalidChange={onInvalidChange}
            showJSONEditor
          />
        </ExpandedSelectedOption>
      )}
      <JsonEditorComponent
        option={option}
        isModal={false}
        onChange={onChange}
        basicOption={basicOption}
        supportsTitleEditing={supportsTitleEditing}
        onRemove={onRemove}
        setIsDragDisabled={setIsDragDisabled}
        currentValue={currentValue}
        optionMetaData={optionMetaData}
        onInvalidChange={onInvalidChange}
        onOpenModal={onOpenModal}
        showJSONEditor={isExpanded}
        toggleExpanded={handleToggleExpanded}
        editorRef={ref => {
          editorRef.current = ref;
        }}
      />
    </>
  );
};

SelectedOptionWithJsonEditor.defaultProps = {
  optionMetaData: null,
  supportsTitleEditing: false,
};

SelectedOptionWithJsonEditor.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
    isDisabled: PropTypes.bool,
  }).isRequired,
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
  onRemove: PropTypes.func.isRequired,
};
