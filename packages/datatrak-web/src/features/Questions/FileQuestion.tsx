/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { FileUploadField } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { InputHelperText } from '../../components';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const Wrapper = styled.div`
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

export const FileQuestion = ({
  label,
  required,
  detailLabel,
  controllerProps: { onChange, value: selectedFile, name },
}: SurveyQuestionInputProps) => {
  const handleChange = (_e, _name, files) => {
    if (!files || files.length === 0) return onChange(null);
    const file = files[0];
    onChange({
      name: file.name,
      value: file,
    });
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
        FormHelperTextComponent={InputHelperText}
        required={required}
      />
    </Wrapper>
  );
};
