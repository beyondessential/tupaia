import React from 'react';
import { Box, Grid } from '@material-ui/core';

// use moment to format the timestamp
const TimestampAndMenu = timestamp => (
  <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={4}>
      23/03/1987
    </Grid>
    <Grid item xs={4}>
      <Box textAlign="right">6:00 pm</Box>
    </Grid>
    <Grid item xs={3}>
      {/*<LongMenu />*/}
    </Grid>
  </Grid>
);
