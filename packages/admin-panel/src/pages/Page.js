/**
 * Tupaia Admin
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

export const Header = ({ children }) => <div style={localStyles.headerContainer}>{children}</div>;

Header.propTypes = {
  children: PropTypes.node,
};

Header.defaultProps = {
  children: null,
};

export const Title = ({ children }) => <h3>{children}</h3>;

Title.propTypes = {
  children: PropTypes.node,
};

Title.defaultProps = {
  children: null,
};

export const HeaderButtons = ({ children }) => (
  <div style={localStyles.headerButtonContainer}>{children}</div>
);

HeaderButtons.propTypes = {
  children: PropTypes.node,
};

HeaderButtons.defaultProps = {
  children: null,
};

export const Body = ({ children }) => <div>{children}</div>;

Body.propTypes = {
  children: PropTypes.node,
};

Body.defaultProps = {
  children: null,
};

export const Page = ({ children }) => <div style={localStyles.pageContainer}>{children}</div>;

Page.propTypes = {
  children: PropTypes.node,
};

Page.defaultProps = {
  children: null,
};

const localStyles = {
  pageContainer: {
    padding: '0px 40px',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerButtonContainer: {
    display: 'grid',
    gridAutoFlow: 'column',
    columnGap: 20,
  },
};
