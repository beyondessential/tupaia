import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';

const IconButton = styled(MuiIconButton)`
  border: 1px solid
    ${props =>
      props.$disabled ? props.theme.palette.grey['400'] : props.theme.palette.primary.main};
  border-radius: 3px;
  padding: 13px;
  color: ${props => props.theme.palette.primary.main};
  height: 45px;
  font-size: 16px;
  margin-left: 10px;
`;

export const PlayButton = ({ disabled, fetchPreviewData }) => {
  return (
    <IconButton disabled={disabled} $disabled={disabled} onClick={fetchPreviewData}>
      <PlayIcon />
      Preview
    </IconButton>
  );
};

PlayButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  fetchPreviewData: PropTypes.func.isRequired,
};
