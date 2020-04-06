/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { ErrorOutline, NotificationImportant } from '@material-ui/icons';
import Card from '@material-ui/core/Card';
import MuiTabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';
import PropTypes from 'prop-types';

const Tab = styled(({ ...rest }) => <MuiTab classes={{ selected: 'selected' }} {...rest} />)`
  border-right: 1px solid ${COLORS.GREY_DE};
  border-bottom: 1px solid ${COLORS.GREY_DE};
  background: ${COLORS.GREY_FB};

  &:last-child {
    border-right: none;
  }

  &.selected {
    background: white;
    color: ${props => props.theme.palette.primary.main};
    border-bottom: 1px solid transparent;
  }
`;

const TabPanel = ({ children, value, index, ...props }) => (
  <Typography
    component="div"
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...props}
  >
    {value === index && <Box p={3}>{children}</Box>}
  </Typography>
);

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export const Tabs = ({ data }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Card variant="outlined">
      <MuiTabs value={value} onChange={handleChange} variant="fullWidth" textColor="secondary">
        {data.map(({content, ...props}, index) => (
          <Tab key={index} {...props} />
        ))}
      </MuiTabs>
      {data.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Card>
  );
};