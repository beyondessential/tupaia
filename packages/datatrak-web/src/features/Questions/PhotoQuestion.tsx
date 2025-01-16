import React from 'react';
import styled from 'styled-components';
import { ImageUploadField } from '@tupaia/ui-components';
import { InputHelperText } from '../../components';
import { SurveyQuestionInputProps } from '../../types';

const Wrapper = styled.div`
  .file_upload_label {
    text-transform: none;
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
  .upload_wrapper {
    align-items: unset;
  }
  label {
    justify-content: space-between;
    flex: 1;
  }
  .MuiFormHelperText-root {
    margin-bottom: 0.2rem;
  }
  .MuiButtonBase-root {
    max-width: 20rem;
  }
`;

export const PhotoQuestion = ({
  label,
  name,
  required,
  detailLabel,
  controllerProps: { onChange, value, invalid, ref },
}: SurveyQuestionInputProps) => {
  const handleDelete = () => {
    onChange(null);
  };
  return (
    <Wrapper ref={ref}>
      <ImageUploadField
        imageSrc={value!}
        onChange={onChange}
        onDelete={handleDelete}
        secondaryLabel={detailLabel!}
        label={label!}
        name={name!}
        required={required}
        avatarVariant="square"
        FormHelperTextComponent={InputHelperText}
        error={invalid}
      />
    </Wrapper>
  );
};
