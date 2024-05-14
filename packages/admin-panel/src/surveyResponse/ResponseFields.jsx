/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Select, DateTimePicker } from '@tupaia/ui-components';
import { ApprovalStatus } from '@tupaia/types';
import { format } from 'date-fns';
import { Autocomplete } from '../autocomplete';
import { useDebounce } from '../utilities';
import { useEntities } from '../VizBuilderApp/api';

const InputSection = styled.div`
  margin-block-start: 1.25rem;
`;

const BorderedSection = styled.div`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 4px;
  padding: 1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ResponseFieldHeading = styled(Typography)`
  font-weight: 500;
  padding-bottom: 0.5rem;
`;

const ResponseFieldWrapper = styled.div`
  padding: 1rem 0;
  ${Row} & {
    width: 49%;
  }
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
    <>
      <BorderedSection>
        <ResponseField title="Survey" value={surveyName} />
        <Row>
          <ResponseField title="Assessor" value={fields.assessor_name} />
          <ResponseField
            title="Date of Survey"
            value={format(new Date(fields.end_time), 'yyyy/MM/dd hh:mm a')}
          />
        </Row>
      </BorderedSection>
      <InputSection>
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

        <DateTimePicker
          label="Date Of Data"
          name="dataTime"
          value={fields.data_time}
          required
          onChange={AESTDate => {
            onChange('data_time', format(AESTDate, 'yyyy-MM-dd HH:mm:ss'));
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
      </InputSection>
    </>
  );
};

ResponseFields.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
  surveyName: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  onChange: PropTypes.object.isRequired,
  setSelectedEntity: PropTypes.func.isRequired,
};
