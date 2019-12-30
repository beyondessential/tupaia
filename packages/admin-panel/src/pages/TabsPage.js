/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { history } from '../store';
import { Tabs } from '../widgets';

const getTabIndex = () => {
  const queryStrings = queryString.parse(window.location.search);
  return parseInt(queryStrings.tab, 10) || 0;
};

const setTabIndex = tabIndex => {
  const queryStrings = queryString.parse(window.location.search);
  queryStrings.tab = tabIndex;

  history.push({
    search: `?${queryString.stringify(queryStrings)}`,
  });
};

export const TabsPage = ({ tabs }) => (
  <div>
    <Tabs
      tabs={tabs.map(({ title }, index) => ({
        label: title,
        value: index,
      }))}
      activeValue={getTabIndex()}
      onSelectTab={activeIndex => setTabIndex(activeIndex)}
      style={localStyles.tabs}
    />
    {tabs[getTabIndex()].component}
  </div>
);

const localStyles = {
  tabs: {
    margin: '0 30px 20px',
  },
};

TabsPage.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({ title: PropTypes.string, component: PropTypes.element }),
  ).isRequired,
};
