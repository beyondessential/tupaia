/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { TextField, Checkbox } from '@tupaia/ui-components';
import { Accordion, AccordionDetails, AccordionSummary, Grid } from '@material-ui/core';

import PropTypes from 'prop-types';

export const GoogleSheetsDataTableConfigEditFields = ({ onEditField, recordData }) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [hasHeaderRow, setHasHeaderRow] = useState(false);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            Spreadsheet ID
          </Grid>
          <Grid item xs={4}>
            Sheet Name
          </Grid>
          <Grid item xs={4}>
            Has header row
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <TextField
              value={spreadsheetId}
              name="Spreadsheet ID"
              onChange={event => {
                const { value } = event.target;
                setSpreadsheetId(value);
                onEditField('config', {
                  ...(recordData.config || {}),
                  spreadsheetId: value,
                });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              value={sheetName}
              name="Sheet Name"
              onChange={event => {
                const { value } = event.target;
                setSheetName(value);
                onEditField('config', {
                  ...(recordData.config || {}),
                  sheetName: value,
                });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Checkbox
              name="Has header row"
              color="primary"
              checked={hasHeaderRow}
              onChange={event => {
                const { checked } = event.target;
                setHasHeaderRow(checked);
                onEditField('config', {
                  ...(recordData.config || {}),
                  hasHeaderRow: checked,
                });
              }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

GoogleSheetsDataTableConfigEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
