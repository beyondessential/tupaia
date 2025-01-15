import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const Header = styled.div`
  position: relative;
  padding: 2.2rem 1.875rem 2.4rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  .MuiTypography-h2 {
    line-height: 1.4;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
`;

export const DialogHeader = ({ title, handleClose, className }) => (
  <Header className={className}>
    <Typography variant="h2">{title}</Typography>
    <CloseButton color="inherit" onClick={handleClose} aria-label="close">
      <CloseIcon />
    </CloseButton>
  </Header>
);

DialogHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  handleClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

DialogHeader.defaultProps = {
  className: null,
};
