import React from 'react';
import styled from 'styled-components';
import { FilePicker } from '../Icons';
import { InputLabel } from './InputLabel';

const HiddenInput = styled.input.attrs({ type: 'file' })`
  display: none;
`;

const PseudoInput = styled(InputLabel)`
  border-radius: 0.1875rem;
  border: 0.0625rem dashed ${({ theme }) => theme.palette.grey['400']};
  cursor: pointer;
  flex-direction: column;
  inline-size: 100%;
  padding: 1.25rem;
  transition: background-color 100ms ease;

  :hover,
  :active,
  :focus-visible {
    background-color: #f4f9ff;
  }
`;

const PrimaryLabel = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
`;

const SecondaryLabel = styled.p`
  color: ${({ theme }) => theme.palette.grey['400']};
  font-size: 0.6875rem;
  font-weight: 400;
`;

const ChooseFileButton = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  &:hover {
    text-decoration: underline;
  }
`;

interface FileUploaderProps {
  FormHelperTextComponent?: React.ElementType;
  accept?: string;
  fileName: string;
  helperText?: string;
  label?: React.ReactNode;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | null,
    fileName?: string,
    files?: FileList | null | undefined,
  ) => void;
  maxSizeInBytes?: number;
  multiple?: boolean;
  name: string;
  required?: boolean;
  showFileSize?: boolean;
}

export const FileUploader = ({ accept, multiple, name }: FileUploaderProps) => {
  // const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const chooseFileLabel = multiple ? 'choose files' : 'choose file';
  const acceptedFileTypesLabel = accept?.split(',').join(' ') ?? 'any';

  return (
    <div>
      <PseudoInput
        htmlFor={name}
        label={
          <>
            <FilePicker />
            <PrimaryLabel>
              Drag & drop or <ChooseFileButton>{chooseFileLabel}</ChooseFileButton> to upload
            </PrimaryLabel>
            <SecondaryLabel>Supported file types: {acceptedFileTypesLabel}</SecondaryLabel>
          </>
        }
      />
      <HiddenInput id={name} />
    </div>
  );
};
