/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';
import { getEditorState } from './selectors';
import { InputField } from '../widgets/InputField/InputField';
import { getFieldSourceToEdit } from './utils';

/**
 * A wrapper around the InputField component that connects it to the editor state to get errors
 */
const mapStateToProps = (state, ownProps) => {
  const { field } = ownProps;
  const editorState = getEditorState(state);
  const { validationErrors } = editorState;
  const editKey = getFieldSourceToEdit(field);
  const error = validationErrors[editKey];
  return {
    error,
  };
};

export const EditorInputField = connect(mapStateToProps)(InputField);
