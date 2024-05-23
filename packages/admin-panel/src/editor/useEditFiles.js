import { useEffect, useState } from 'react';

// Files cannot be stored in redux (https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions)
// So instead we keep a map of fieldKey -> File, and store only the filename in redux.

export const useEditFiles = (fields, onEditField) => {
  const [files, setFiles] = useState({});
  const handleSetFormFile = (inputKey, { fileName, file }) => {
    setFiles({
      ...files,
      [inputKey]: file,
    });
    onEditField(inputKey, fileName);
  };
  useEffect(() => {
    // Rely on the fact that opening/closing the edit view clears `fields` to make sure that `files` gets wiped between forms.
    setFiles({});
  }, [fields]);

  return { files, handleSetFormFile };
};
