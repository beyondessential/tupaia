export const getEditorState = ({ editor }) => editor;
export const getIsUnchanged = ({ editor }) => Object.keys(editor.editedFields).length === 0;
