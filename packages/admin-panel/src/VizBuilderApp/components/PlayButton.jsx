import React from 'react';
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';

import { usePreviewDataContext, useVizConfigErrorContext } from '../context';

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

export const PlayButton = () => {
  const { setFetchEnabled, setShowData } = usePreviewDataContext();
  const { hasError: vizConfigHasError } = useVizConfigErrorContext();

  const handleClick = () => {
    setFetchEnabled(true);
    setShowData(true);
  };

  return (
    <IconButton disabled={vizConfigHasError} onClick={handleClick}>
      <PlayIcon />
    </IconButton>
  );
};
