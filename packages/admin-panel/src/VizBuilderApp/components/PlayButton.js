/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiIconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';

const IconButton = styled(MuiIconButton)`
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-radius: 3px;
  padding: 7px;
  color: ${props => props.theme.palette.primary.main};

  .MuiSvgIcon-root {
    width: 1em;
    height: 1em;
  }
`;

export const PlayButton = ({ setEnabled }) => {
  const handleClick = () => {
    setEnabled(true);
  };

  return (
    <IconButton onClick={handleClick}>
      <PlayIcon />
    </IconButton>
  );
};

PlayButton.propTypes = {
  setEnabled: PropTypes.func.isRequired,
};
