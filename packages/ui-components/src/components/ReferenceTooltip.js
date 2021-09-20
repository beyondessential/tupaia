/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Typography, Tooltip, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import styled from 'styled-components';

const DEFAULT = 'default';
const TILE_SET = 'tileSet';
const MAP_OVERLAY = 'mayOverlay';

const IconButton = styled(InfoRoundedIcon)`
  font-size: 16px;
  color: grey;
  transition: color 0.2s ease;

  &:hover {
    background-color: initial;
    color: white;
  }
`;

const styles = {
  link: { color: '#22c7fc' },
  iconButton: {
    [DEFAULT]: { fontSize: '16px' },
    [TILE_SET]: { fontSize: '16px', marginBottom: '-1px' },
    [MAP_OVERLAY]: { fontSize: '20px', marginTop: '3px' },
  },
  typography: { backgroundColor: 'black' },
};

const StyledToolTip = withStyles(theme => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}))(Tooltip);

const getContent = reference => {
  const { text, name, link } = reference;
  if (text) {
    return (
      <Typography variant="caption" style={styles.typography}>
        <span>{text} </span>
      </Typography>
    );
  }
  return (
    <Typography variant="caption" style={styles.typography}>
      <span>Source: </span>
      <a style={styles.link} href={link} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    </Typography>
  );
};

export const ReferenceTooltip = props => {
  const { reference, iconStyleOption } = props;
  const content = getContent(reference);

  return (
    <StyledToolTip arrow interactive placement="top" enterTouchDelay={50} title={content}>
      <IconButton
        style={
          iconStyleOption && styles.iconButton[iconStyleOption]
            ? styles.iconButton[iconStyleOption]
            : styles.iconButton[DEFAULT]
        }
      />
    </StyledToolTip>
  );
};

ReferenceTooltip.propTypes = {
  reference: PropTypes.object,
  iconStyleOption: PropTypes.string,
};
ReferenceTooltip.defaultProps = {
  iconStyleOption: null,
  reference: null,
};
