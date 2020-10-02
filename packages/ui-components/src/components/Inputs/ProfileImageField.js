/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import MuiAvatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import { FlexStart } from '../Layout';
import { GreyOutlinedButton } from '../Button';

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

const Avatar = styled(MuiAvatar)`
  position: relative;
  color: white;
  background: ${props => props.theme.palette.success.main};
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

export const ProfileImageField = React.memo(
  ({ name, profileImage, userInitial, onDelete, onChange }) => {
    const inputEl = useRef(null);

    const handleChange = event => {
      onChange(event);
    };

    return (
      <Label as="label" htmlFor={name}>
        <HiddenFileInput ref={inputEl} id={name} name={name} type="file" onChange={handleChange} />
        <Box position="relative">
          <Avatar src={profileImage}>{userInitial}</Avatar>
          <DeleteButton onClick={onDelete}>
            <DeleteIcon />
          </DeleteButton>
        </Box>
        <Box>
          <TextLabel>Your Avatar</TextLabel>
          <GreyOutlinedButton component="span">Upload photo</GreyOutlinedButton>
        </Box>
      </Label>
    );
  },
);

ProfileImageField.propTypes = {
  name: PropTypes.string.isRequired,
  userInitial: PropTypes.string,
  profileImage: PropTypes.string,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
};

ProfileImageField.defaultProps = {
  userInitial: null,
  profileImage: null,
  onChange: () => {},
  onDelete: () => {},
};
