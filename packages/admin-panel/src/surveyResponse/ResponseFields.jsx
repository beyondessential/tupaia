import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Select, DateTimePicker, useDebounce } from '@tupaia/ui-components';
import { ApprovalStatus } from '@tupaia/types';
import { format } from 'date-fns';
import { Autocomplete } from '../autocomplete';
import { useEntities } from '../VizBuilderApp/api';
import { EntityOptionLabel } from '../widgets';

const InputSection = styled.div`
  margin-block-start: 1.25rem;
  margin-block-end: 1.2rem;
`;

const BorderedSection = styled.div`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 4px;
  padding: 1.1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  > div {
    width: 49%;
  }
  .MuiFormControl-root {
    margin-block-end: 0;
  }
`;

const ResponseFieldHeading = styled(Typography).attrs({
  variant: 'h3',
})`
  padding-block-end: 0.2rem;
  font-size: ${props => props.theme.typography.body2.fontSize};
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  color: ${props => props.theme.palette.text.secondary};
`;

const ResponseFieldValue = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
`;

const ResponseFieldWrapper = styled.div`
  + ${Row} {
    margin-block-start: 1.25rem;
  }
`;

const ResponseField = ({ title, value }) => {
  return (
    <ResponseFieldWrapper>
      <ResponseFieldHeading>{title}</ResponseFieldHeading>
      <ResponseFieldValue>{value}</ResponseFieldValue>
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
          renderOption={option => {
            return <EntityOptionLabel {...option} />;
          }}
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

        <Row>
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
        </Row>
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
