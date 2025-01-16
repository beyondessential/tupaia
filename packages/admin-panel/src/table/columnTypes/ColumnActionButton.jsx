import { IconButton } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Button = styled(IconButton).attrs(props => ({
  color: props.color || 'primary',
}))`
  padding: 0.3rem;
`;

export const ColumnActionButton = ({ title, children, ...props }) => {
  if (!title) return <Button {...props}>{children}</Button>;
  return (
    <Tooltip title={title}>
      <Button {...props}>{children}</Button>
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
