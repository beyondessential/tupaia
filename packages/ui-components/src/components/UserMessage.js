/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
// import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';
// import { Warning } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

// MuiCardHeader-action

const ActionIcon = () => (
  <IconButton aria-label="settings">
    <MoreVertIcon />
  </IconButton>
);

const TestRow = () => (
  <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={4}>
      23/03/1987
    </Grid>
    <Grid item xs={4}>
      <Box textAlign="right">6:00 pm</Box>
    </Grid>
    <Grid item xs={3}>
      <IconButton aria-label="settings">
        <MoreVertIcon />
      </IconButton>
    </Grid>
  </Grid>
);

const StyledCardHeader = styled(CardHeader)`
  .MuiCardHeader-action {
    flex: 1 1 auto;
    align-self: center;
    margin-top: 0;
  }
`;

const StyledCard = styled(Card)`
  .MuiCardHeader-root {
    padding: 8px 16px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #dedee0;
  }
`;

// TODO
// ADD MENU TO MoreVertIcon https://material-ui.com/components/menus/#menus

export const UserMessage = props => (
  <StyledCard variant="outlined">
    <StyledCardHeader
      avatar={<Avatar aria-label="recipe">R</Avatar>}
      title={<Box fontWeight="fontWeightBold">Dr. Sarah De Jones</Box>}
      action={<TestRow />}
    />
    <CardMedia image="/static/images/cards/paella.jpg" title="Paella dish" />
    <CardContent>
      <Typography variant="body2" color="textSecondary" component="p">
        This impressive paella is a perfect party dish and a fun meal to cook together with your
        guests. Add 1 cup of frozen peas along with the mussels, if you like.
      </Typography>
    </CardContent>
  </StyledCard>
);
