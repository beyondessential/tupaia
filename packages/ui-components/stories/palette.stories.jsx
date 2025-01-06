/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import * as COLORS from './story-utils/theme/colors';

export default {
  title: 'Palette',
};

const Box = styled(props => (
  <MuiBox {...props}>
    <div className="label">{props.bgcolor}</div>
  </MuiBox>
))`
  position: relative;
  height: 180px;

  .label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: #adaeaf;
  }
`;

export const MaterialUIPalette = () => (
  <MuiBox p={5} style={{ background: COLORS.LIGHTGREY }}>
    <Grid container spacing={4}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="primary.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="secondary.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="error.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="warning.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="info.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="success.main" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="text.primary" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="text.secondary" />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor="text.disabled" />
      </Grid>
    </Grid>
  </MuiBox>
);

export const DesignColors = () => (
  <MuiBox p={5} style={{ background: COLORS.LIGHTGREY }}>
    <Grid container spacing={4}>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.TEXT_DARKGREY} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.GREY_72} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.DARKGREY} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.BLUE} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.DARK_BLUE} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.YELLOW} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.RED} />
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
        <Box bgcolor={COLORS.GREEN} />
      </Grid>
    </Grid>
  </MuiBox>
);
