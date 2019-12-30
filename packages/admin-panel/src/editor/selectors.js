/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const getEditorState = ({ editor }) => editor;
export const getIsUnchanged = ({ editor }) => Object.keys(editor.editedFields).length === 0;
