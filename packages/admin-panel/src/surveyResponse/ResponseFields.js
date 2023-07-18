/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import { Select, DatePicker } from '@tupaia/ui-components';
import { ApprovalStatus } from '@tupaia/types';
import { Autocomplete } from '../autocomplete';
import { useDebounce } from '../utilities';
import { useEntities } from '../VizBuilderApp/api';

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
      <ResponseFieldHeading variant="body2">{title}</ResponseFieldHeading>
      <Typography variant="body2">{value}</Typography>
    </ResponseFieldWrapper>
  );
};

ResponseField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const approvalStatusOptions = Object.values(ApprovalStatus).map(type => ({
  label: type,
  value: type,
}));

export const ResponseFields = ({
  surveyName,
  selectedEntity,
  fields,
  onChange,
  setSelectedEntity,
}) => {
  const [entitySearchTerm, setEntitySearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(entitySearchTerm, 100);

  const { data: entities = [], isLoading: entityIsLoading } = useEntities(debouncedSearchTerm);
  const limitedLocations = entities.slice(0, 20);

  return (
    <Paper square={false} variant="outlined" style={{ padding: 20, marginBottom: 25 }}>
      <SectionWrapper>
        <ResponseField title="Survey" value={surveyName} />
        <ResponseField title="Assessor" value={fields.assessor_name} />
        <ResponseField title="Date of Survey" value={fields.end_time} />
        <Autocomplete
          value={selectedEntity}
          label="Entity"
          options={limitedLocations}
          getOptionSelected={(option, selected) => {
            return option.id === selected.id;
          }}
          getOptionLabel={option => option?.name || ''}
          isLoading={entityIsLoading}
          onChangeSelection={(event, selectedValue) => {
            if (!selectedValue) {
              return;
            }
            onChange('entity_id', selectedValue.id);
            setSelectedEntity(selectedValue);
          }}
          onChangeSearchTerm={setEntitySearchTerm}
          searchTerm={entitySearchTerm}
          placeholder="type to search"
          optionLabelKey="entity-name"
        />

        <DatePicker
          label="Date Of Data"
          name="dataTime"
          value={fields.data_time}
          required
          onChange={UTCDate => {
            onChange('data_time', UTCDate);
          }}
        />

        <Select
          id="approval-status"
          label="Approval Status"
          name="approvalStatus"
          required
          options={approvalStatusOptions}
          onChange={event => {
            onChange('approval_status', event.target.value);
          }}
          value={fields.approval_status}
        />
      </SectionWrapper>
    </Paper>
  );
};

ResponseFields.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
  surveyName: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  onChange: PropTypes.object.isRequired,
  setSelectedEntity: PropTypes.func.isRequired,
};
