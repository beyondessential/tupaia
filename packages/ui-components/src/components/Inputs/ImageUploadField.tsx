import { AvatarProps, Box, Fab, FormHelperText, FormLabel } from '@material-ui/core';
import { Trash2 as DeleteIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import { Avatar } from '../Avatar';
import { GreyOutlinedButton } from '../Button';
import { FlexStart } from '../Layout';
import { InputLabel } from './InputLabel';

const HiddenFileInput = styled.input.attrs({
  // TODO: Accept 'image/*' and convert in backend if needed
  accept: 'image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp',
})`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

const Wrapper = styled(FlexStart)`
  align-items: flex-start;
`;

const StyledAvatar = styled(Avatar)`
  position: relative;
  color: white;
  font-weight: 600;
  width: 5.3rem;
  height: 5.3rem;
  font-size: 2.8rem;
  margin-right: 1rem;
`;

const DeleteButton = styled(Fab)`
  position: absolute;
  bottom: 0;
  right: 0.8rem;
  width: 1.875rem;
  min-width: 1.875rem;
  height: 1.875rem;
  min-height: 1.875rem;
  box-shadow: none;
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  color: ${props => props.theme.palette.text.secondary};

  svg {
    font-size: 1.125rem;
  }
`;

const TextLabel = styled(FormLabel).attrs({
  component: 'span',
})`
  font-size: 0.68rem;
  line-height: 0.8rem;
  text-transform: uppercase;
  color: ${props => props.theme.palette.text.tertiary};
`;

const ErrorMessage = styled(FormHelperText)`
  color: ${props => props.theme.palette.error.main};
  ${GreyOutlinedButton} + & {
    margin-top: 0.8rem;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  position: relative;
`;

type Base64 = string | null | ArrayBuffer;

interface ImageUploadFieldProps {
  name: string;
  imageSrc?: string;
  avatarInitial?: string;
  onChange?: (encodedImage: Base64) => void;
  onDelete?: () => void;
  label: string;
  buttonLabel?: string;
  avatarVariant?: AvatarProps['variant'];
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  secondaryLabel?: string;
  tooltip?: string;
  required?: boolean;
  FormHelperTextComponent?: React.ElementType;
  error?: boolean;
}

const createBase64Image = (fileObject: File): Promise<Base64> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(fileObject);
  });
};

export const ImageUploadField = React.memo(
  ({
    name,
    imageSrc,
    onDelete = () => {},
    onChange = () => {},
    avatarInitial,
    label,
    buttonLabel = 'Upload photo',
    avatarVariant = 'circle',
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    secondaryLabel,
    tooltip,
    required,
    FormHelperTextComponent,
    error,
  }: ImageUploadFieldProps) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputEl = useRef<HTMLInputElement | null>(null);

    const handleDelete = () => {
      if (inputEl?.current) inputEl.current.value = '';
      onDelete();
      setErrorMessage(null);
    };

    const getImageSize = async (file: File) => {
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      await img.decode();
      const height = img.naturalHeight;
      const width = img.naturalWidth;
      window.URL.revokeObjectURL(img.src);
      return { height, width };
    };

    const validateImageSize = async (file: File | null) => {
      // If no max height or width is provided, or if file is not set, we don't need to validate so can return null.
      if (!file || (!minWidth && !minHeight && !maxWidth && !maxHeight)) return null;
      // Check image is within the specified height and width, and return the appropriate message if so, else null.
      const { height, width } = await getImageSize(file);

      if ((maxHeight && height > maxHeight) || (maxWidth && width > maxWidth)) {
        return `Image too large (max. ${maxWidth} × ${maxHeight})`;
      }
      if ((minHeight && height < minHeight) || (minWidth && width < minWidth)) {
        return `Image too small (min. ${minWidth} × ${minHeight})`;
      }
      return null;
    };
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const image = event.target.files?.[0] ?? null;
      const newErrorMessage = await validateImageSize(image);
      setErrorMessage(newErrorMessage);
      // Only call onChange if image is validated, so the user can't upload anything invalid.
      if (!newErrorMessage) {
        if (!image) {
          return onChange(image);
        }
        const encodedImage = await createBase64Image(image);
        onChange(encodedImage);
      }
    };

    return (
      <Wrapper className="upload_wrapper">
        <Box position="relative">
          <StyledAvatar
            initial={avatarInitial}
            src={imageSrc}
            variant={avatarVariant}
            alt={`Image for field ${label}`}
          >
            {avatarInitial}
          </StyledAvatar>
          {imageSrc && (
            <DeleteButton aria-label="Clear selected image" onClick={handleDelete}>
              <DeleteIcon />
            </DeleteButton>
          )}
        </Box>
        <Label htmlFor={name}>
          <InputLabel
            className="file_upload_label"
            label={label}
            tooltip={tooltip}
            as={TextLabel}
            labelProps={{
              required,
              error: error || !!errorMessage,
            }}
            applyWrapper
          />
          {secondaryLabel && (
            <FormHelperText component={FormHelperTextComponent || 'p'} id={`${name}-description`}>
              {secondaryLabel}
            </FormHelperText>
          )}
          <HiddenFileInput
            ref={inputEl}
            id={name}
            name={name}
            type="file"
            onChange={handleFileUpload}
            aria-describedby={secondaryLabel ? `${name}-description` : ''}
            aria-invalid={!!errorMessage || error}
            required={required}
          />
          <GreyOutlinedButton component="span">{buttonLabel}</GreyOutlinedButton>
          {errorMessage && <ErrorMessage id={`${name}-error-message`}>{errorMessage}</ErrorMessage>}
        </Label>
      </Wrapper>
    );
  },
);
