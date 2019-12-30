/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

const getTabStyle = isActive => {
  if (isActive) {
    return { ...localStyles.tab, ...localStyles.tabActive };
  }

  return localStyles.tab;
};

export const Tabs = ({ tabs, onSelectTab, activeValue, style }) => (
  <div style={{ ...localStyles.tabs, ...style }}>
    {tabs.map(({ label, value }) => (
      <button
        onClick={() => onSelectTab(value)}
        key={value}
        style={getTabStyle(activeValue === value)}
        type={'button'}
      >
        {label}
      </button>
    ))}
  </div>
);

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSelectTab: PropTypes.func.isRequired,
  style: PropTypes.object,
};

Tabs.defaultProps = {
  style: {},
};

const localStyles = {
  tabs: {
    borderBottom: '1px solid #eee',
  },
  tab: {
    padding: 10,
    display: 'inline-block',
    color: '#666',
    outline: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  tabActive: {
    padding: 10,
    display: 'inline-block',
    color: 'black',
    borderBottom: '1px solid black',
    fontWeight: 'bold',
  },
};
