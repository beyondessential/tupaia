/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PickerToolbar from '@material-ui/pickers/_shared/PickerToolbar';
import ToolbarButton from '@material-ui/pickers/_shared/ToolbarButton';
import getISOWeek from 'date-fns/get_iso_week';
import startOfISOWeek from 'date-fns/start_of_iso_week';
import endOfISOWeek from 'date-fns/end_of_iso_week';
import format from 'date-fns/format';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

export const CustomToolbar = ({ date, isLandscape, openView, setOpenView, title }) => {
  const handleChangeViewClick = view => () => {
    setOpenView(view);
  };

  const classes = useStyles();

  return (
    <PickerToolbar className={classes.toolbar} title={title} isLandscape={isLandscape}>
      {/*<ToolbarButton*/}
      {/*  onClick={handleChangeViewClick('year')}*/}
      {/*  variant="h6"*/}
      {/*  label={format(date, 'yyyy')}*/}
      {/*  selected={openView === 'year'}*/}
      {/*/>*/}
      <ToolbarButton
        onClick={handleChangeViewClick('date')}
        variant="h4"
        selected={openView === 'date'}
        label={`Week ${getISOWeek(date)} &#183; ${format(startOfISOWeek(date), 'MMM d , yyyy')}`}
      />
    </PickerToolbar>
  );
};
