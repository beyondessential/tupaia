/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { Tooltip } from '@tupaia/ui-components';

const Button = styled(IconButton).attrs({
  color: 'primary',
})`
  padding: 0.3rem;
`;

export const ColumnActionButton = ({ title, children, ...props }) => {
  if (!title) return <Button {...props}>{children}</Button>;
  return (
    <Tooltip title={title}>
      {/** Need a span here because if the button is disabled MUI complains that the tooltip needs a non-disabled child element */}
      <span>
        <Button {...props}>{children}</Button>
      </span>
    </Tooltip>
  );
};

ColumnActionButton.defaultProps = {
  title: '',
  children: null,
};

ColumnActionButton.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
