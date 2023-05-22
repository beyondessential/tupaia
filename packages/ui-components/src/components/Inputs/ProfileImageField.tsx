/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { FlexStart } from '../Layout';
import { GreyOutlinedButton } from '../Button';
import { Avatar } from '../Avatar';

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

const TextLabel = styled.div`
  font-size: 0.68rem;
  line-height: 0.8rem;
  text-transform: uppercase;
  color: ${props => props.theme.palette.text.tertiary};
  margin-bottom: 0.6rem;
`;

interface ProfileImageFieldProps {
  name: string;
  profileImage?: string;
  userInitial?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
}

export const ProfileImageField = React.memo(
  ({
    name,
    profileImage,
    userInitial,
    onDelete = () => {},
    onChange = () => {},
  }: ProfileImageFieldProps) => {
    const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
    const inputEl = useRef<HTMLInputElement | null>(null);

    const handleDelete = () => {
      setConfirmModalIsOpen(false);
      if (inputEl && inputEl.current) inputEl.current.value = '';
      onDelete();
    };

    return (
      <Label as="label" htmlFor={name}>
        <HiddenFileInput ref={inputEl} id={name} name={name} type="file" onChange={onChange} />
        <Box position="relative">
          <StyledAvatar initial={userInitial} src={profileImage}>
            {userInitial}
          </StyledAvatar>
          {profileImage && (
            <DeleteButton onClick={() => setConfirmModalIsOpen(true)}>
              <DeleteIcon />
            </DeleteButton>
          )}
        </Box>
        <Box>
          <TextLabel>Your Avatar</TextLabel>
          <GreyOutlinedButton component="span">Upload photo</GreyOutlinedButton>
        </Box>
        <ConfirmDeleteModal
          isOpen={confirmModalIsOpen}
          title="Remove Photo"
          message="Are you sure you want to remove your photo?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmModalIsOpen(false)}
        />
      </Label>
    );
  },
);
