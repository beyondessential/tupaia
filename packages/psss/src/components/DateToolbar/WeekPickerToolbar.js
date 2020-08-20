/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import format from 'date-fns/format';
import PickerToolbar from '@material-ui/pickers/_shared/PickerToolbar';
import Typography from '@material-ui/core/Typography';
import getISOWeek from 'date-fns/get_iso_week';
import startOfISOWeek from 'date-fns/start_of_iso_week';
import endOfISOWeek from 'date-fns/end_of_iso_week';

const PickerBar = styled(PickerToolbar)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Heading = styled(Typography)`
  color: white;
`;

export const WeekPickerToolbar = ({ date, isLandscape, title }) => {
  const start = format(startOfISOWeek(date), 'MMM d');
  const end = format(endOfISOWeek(date), 'MMM d , yyyy');
  return (
    <PickerBar title={title} isLandscape={isLandscape}>
      <Heading variant="h4" gutterBottom>
        Week {getISOWeek(date)}
      </Heading>
      <Heading variant="h5">
        {start} - {end}
      </Heading>
    </PickerBar>
  );
};

WeekPickerToolbar.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  title: PropTypes.string,
  isLandscape: PropTypes.bool,
};

WeekPickerToolbar.defaultProps = {
  isLandscape: true,
  title: null,
};
