/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
`;

const ResponseFieldHeading = styled(Typography)`
  font-weight: 500;
  padding-bottom: 0.5rem;
`;

const ResponseFieldWrapper = styled.div`
  padding: 1rem 0;
`;

const ResponseField = ({ title, value }) => {
  return (
    <ResponseFieldWrapper>
      <ResponseFieldHeading component="h5">{title}</ResponseFieldHeading>
      <Typography component="body1">{value}</Typography>
    </ResponseFieldWrapper>
  );
};

ResponseField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export const ResponseFields = ({
  surveyName,
  selectedEntity,
  existingAndNewFields,
  currentScreenNumber,
}) => {
  return (
    <Paper square={false} variant="outlined" style={{ padding: 20, marginBottom: 25 }}>
      {currentScreenNumber === 0 ? (
        <SectionWrapper>
          <ResponseField title="Survey" value={surveyName} />
          <ResponseField title="Assessor" value={existingAndNewFields.assessor_name} />
          <ResponseField title="Date of Survey" value={existingAndNewFields.end_time} />
        </SectionWrapper>
      ) : (
        <SectionWrapper>
          <ResponseField title="Survey" value={surveyName} />
          <ResponseField title="Assessor" value={existingAndNewFields.assessor_name} />
          <ResponseField title="Date of Survey" value={existingAndNewFields.end_time} />
          <ResponseField title="Entity" value={selectedEntity?.name} />
          <ResponseField title="Date Of Data" value={existingAndNewFields.data_time} />
          <ResponseField title="Approval Status" value={existingAndNewFields.approval_status} />
        </SectionWrapper>
      )}
    </Paper>
  );
};

ResponseFields.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
  surveyName: PropTypes.string.isRequired,
  existingAndNewFields: PropTypes.object.isRequired,
  currentScreenNumber: PropTypes.number.isRequired,
};
