/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormHelperText, Box, Fab } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { FlexStart } from '../Layout';
import { GreyOutlinedButton } from '../Button';
import { Avatar } from '../Avatar';
import { InputLabel } from './InputLabel';

const HiddenFileInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

const Label = styled(FlexStart)`
  margin-bottom: 1.6rem;
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

  .MuiSvgIcon-root {
    font-size: 1.125rem;
  }
`;

const TextLabel = styled.span`
  font-size: 0.68rem;
  line-height: 0.8rem;
  text-transform: uppercase;
  color: ${props => props.theme.palette.text.tertiary};
  margin-bottom: 0.6rem;
`;

const ErrorMessage = styled(FormHelperText)`
  color: ${props => props.theme.palette.error.main};
  ${GreyOutlinedButton} + & {
    margin-top: 0.8rem;
  }
`;

const LabelWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const ImageUploadField = React.memo(
  ({
    name,
    encodedImage,
    onDelete,
    onChange,
    avatarInitial,
    label,
    buttonLabel,
    deleteModal,
    avatarVariant,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    secondaryLabel,
    tooltip,
  }) => {
    const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const inputEl = useRef(null);

    const handleDelete = () => {
      setConfirmModalIsOpen(false);
      inputEl.current.value = '';
      setErrorMessage(null);
      onDelete();
    };

    const getImageSize = async file => {
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      await img.decode();
      const height = img.naturalHeight;
      const width = img.naturalWidth;
      window.URL.revokeObjectURL(img.src);
      return { height, width };
    };

    const validateImageSize = async file => {
      // If no max height or width is provided, or if file is not set, we don't need to validate so can return null.
      if (!file || (!minWidth && !minHeight && !maxWidth && !maxHeight)) return true;
      // Check image is within the specified height and width, and return the appropriate message if so, else null.
      const { height, width } = await getImageSize(file);

      if ((maxHeight && height > maxHeight) || (maxWidth && width > maxWidth)) {
        return 'Image size is too large';
      }
      if ((minHeight && height < minHeight) || (minWidth && width < minWidth)) {
        return 'Image size is too small';
      }
      return null;
    };
    const handleFileUpload = async event => {
      const image = event.target.files[0];
      const newErrorMessage = await validateImageSize(image);
      setErrorMessage(newErrorMessage);
      // Only call onChange if image is validated, so the user can't upload anything invalid.
      if (!newErrorMessage) onChange(image);
    };

    return (
      <Label as="label" htmlFor={name}>
        <HiddenFileInput
          ref={inputEl}
          id={name}
          name={name}
          type="file"
          onChange={handleFileUpload}
          aria-describedby={secondaryLabel ? `${name}-description` : null}
          aria-invalid={!errorMessage}
        />
        <Box position="relative">
          <StyledAvatar initial={avatarInitial} src={encodedImage} variant={avatarVariant}>
            {avatarInitial}
          </StyledAvatar>
          {encodedImage && (
            <DeleteButton onClick={() => setConfirmModalIsOpen(true)}>
              <DeleteIcon />
            </DeleteButton>
          )}
        </Box>
        <LabelWrapper>
          <InputLabel
            className="file_upload_label"
            label={label}
            tooltip={tooltip}
            as={TextLabel}
          />
          {secondaryLabel && (
            <FormHelperText id={`${name}-description`}>{secondaryLabel}</FormHelperText>
          )}
          <GreyOutlinedButton component="span">{buttonLabel}</GreyOutlinedButton>
          {errorMessage && <ErrorMessage id={`${name}-error-message`}>{errorMessage}</ErrorMessage>}
        </LabelWrapper>

        {deleteModal && (
          <ConfirmDeleteModal
            isOpen={confirmModalIsOpen}
            onConfirm={handleDelete}
            onCancel={() => setConfirmModalIsOpen(false)}
            {...deleteModal}
          />
        )}
      </Label>
    );
  },
);

ImageUploadField.propTypes = {
  name: PropTypes.string.isRequired,
  userInitial: PropTypes.string,
  encodedImage: PropTypes.string,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  avatarInitial: PropTypes.string,
  label: PropTypes.string,
  buttonLabel: PropTypes.string,
  deleteModal: PropTypes.object,
  avatarVariant: PropTypes.string,
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  minHeight: PropTypes.number,
  minWidth: PropTypes.number,
  secondaryLabel: PropTypes.string,
  tooltip: PropTypes.string,
};

ImageUploadField.defaultProps = {
  userInitial: undefined,
  encodedImage: null,
  onChange: () => {},
  onDelete: () => {},
  avatarInitial: '',
  buttonLabel: 'Upload photo',
  avatarVariant: 'circular',
  tooltip: '',
  label: '',
  deleteModal: null,
  maxHeight: null,
  maxWidth: null,
  minHeight: null,
  minWidth: null,
  secondaryLabel: '',
};
