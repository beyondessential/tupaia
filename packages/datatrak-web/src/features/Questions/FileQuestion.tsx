/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { FileUploadField } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { QuestionHelperText } from './QuestionHelperText';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  label {
    display: flex;
    flex-direction: column;
  }
  .MuiBox-root {
    margin-top: 0.5rem;
    order: 2; // put the helper text above the input
    span {
      font-size: 0.875rem;
    }
  }
`;

const ClearButton = styled(IconButton)`
  padding: 0.5rem;
  margin-left: 0.5rem;
`;

type Base64 = string | null | ArrayBuffer;

const createEncodedFile = (fileObject: File): Promise<Base64> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(fileObject);
  });
};

export const FileQuestion = ({
  label,
  required,
  detailLabel,
  controllerProps: { onChange, value: selectedFile, name },
}: SurveyQuestionInputProps) => {
  const handleChange = async (_e, _name, files) => {
    const file = files[0];
    const encodedFile = await createEncodedFile(file);
    // convert to an object with an encoded file so that it can be handled in the backend and uploaded to s3
    onChange({
      name: file.name,
      value: encodedFile,
    });
  };

  const handleClearFile = () => {
    onChange(null);
  };
  return (
    <Wrapper>
      <FileUploadField
        name={name}
        fileName={selectedFile?.name}
        onChange={handleChange}
        label={label!}
        helperText={detailLabel!}
        maxSizeInBytes={MAX_FILE_SIZE_BYTES}
        showFileSize
        FormHelperTextComponent={QuestionHelperText}
        required={required}
      />
      {selectedFile?.value && (
        <ClearButton title="Clear file" onClick={handleClearFile}>
          <Close />
        </ClearButton>
      )}
    </Wrapper>
  );
};
