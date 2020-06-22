/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import * as COLORS from '../../constants';

const DrawerFooterHeight = '125px';

const StyledFooter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  height: ${DrawerFooterHeight};
  text-align: center;
  padding: 1.5rem;
  box-shadow: 0px -1px 0px ${COLORS.GREY_DE};

  &:after {
    display: ${props => (props.disabled ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    opacity: 0.5;
  }
`;

const HelperText = styled(Typography)`
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 0.9375rem;
  color: ${COLORS.TEXT_MIDGREY};
`;

export const DrawerFooter = ({ Action, helperText, disabled }) => (
  <StyledFooter disabled={disabled}>
    <Action />
    <HelperText variant="body1">{helperText}</HelperText>
  </StyledFooter>
);

DrawerFooter.propTypes = {
  Action: PropTypes.any.isRequired,
  helperText: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

DrawerFooter.defaultProps = {
  disabled: false,
};
