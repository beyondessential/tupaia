/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';

import { usePreviewData } from '../context';

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

export const PlayButton = React.memo(({ disabled }) => {
  const { setFetchEnabled, setShowData } = usePreviewData();

  const handleClick = () => {
    setFetchEnabled(true);
    setShowData(true);
  };

  return (
    <IconButton disabled={disabled} onClick={handleClick}>
      <PlayIcon />
    </IconButton>
  );
});

PlayButton.propTypes = {
  disabled: PropTypes.bool,
};

PlayButton.defaultProps = {
  disabled: false,
};
