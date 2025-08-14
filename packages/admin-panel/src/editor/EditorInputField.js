import { connect } from 'react-redux';
import { getEditorState } from './selectors';
import { InputField } from '../widgets/InputField/InputField';

/**
 * A wrapper around the InputField component that connects it to the editor state to get errors
 */
const mapStateToProps = (state, { editKey, inputKey }) => {
  const editorState = getEditorState(state);
  const { validationErrors } = editorState;
  const error = validationErrors[editKey ?? inputKey];
  return {
    error,
  };
};

export const EditorInputField = connect(mapStateToProps)(InputField);
