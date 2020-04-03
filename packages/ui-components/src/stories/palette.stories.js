import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

export default {
  title: 'Palette',
};

export const Palette = () => {
  return (
    <Grid container spacing={2} style={{maxWidth: 320}}>
      <Grid item xs={12}>
        <Box bgcolor="primary.main" color="primary.contrastText" p={5} borderRadius={4}>
          primary.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="secondary.main" color="secondary.contrastText" p={5} borderRadius={4}>
          secondary.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="error.main" color="error.contrastText" p={5} borderRadius={4}>
          error.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="warning.main" color="warning.contrastText" p={5} borderRadius={4}>
          warning.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="info.main" color="info.contrastText" p={5} borderRadius={4}>
          info.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="success.main" color="success.contrastText" p={5} borderRadius={4}>
          success.main
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="text.primary" color="background.paper" p={5} borderRadius={4}>
          text.primary
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="text.secondary" color="background.paper" p={5} borderRadius={4}>
          text.secondary
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box bgcolor="text.disabled" color="background.paper" p={5} borderRadius={4}>
          text.disabled
        </Box>
      </Grid>
    </Grid>
  );
}