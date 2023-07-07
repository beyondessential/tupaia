/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React, { useState } from 'react';
import { TextField, Select, DatePicker } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Pagination } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { Button, Typography } from '@material-ui/core';
import { ApprovalStatus } from '@tupaia/types';
import { Autocomplete } from '../autocomplete';
import { useDebounce } from '../utilities';
import { useEntities } from '../VizBuilderApp/api';

const StyledTextField = styled(TextField)`
  justify-content: end;
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  padding: 2rem 0 0.5rem 0;
`;

const SectionHeader = styled(Typography)`
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.25rem;
  padding-bottom: 0.5rem;
  padding-top: 1.5rem;
`;

const approvalStatusOptions = Object.values(ApprovalStatus).map(type => ({
  label: type,
  value: type,
}));

export const SurveyScreens = ({
  survey,
  existingAnswers,
  onChange,
  surveyResponse,
  setUpdatedFields,
  selectedEntity,
  setSelectedEntity,
  existingAndNewFields,
  updatedFields,
  currentScreenNumber,
  setCurrentScreenNumber,
}) => {
  const [updatedAnswers, setUpdatedAnswers] = useState({});
  const [entitySearchTerm, setEntitySearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(entitySearchTerm, 100);

  const { data: entities = [], isLoading: entityIsLoading } = useEntities(debouncedSearchTerm);
  const limitedLocations = entities.slice(0, 20);
  // count screens, add 1 to include editable survey response fields
  const pageCount = survey?.surveyQuestions?.length;
  const screen = survey?.surveyQuestions?.find(
    ({ screen_number }) => screen_number === currentScreenNumber,
  );
  const editableResponseFields = [
    { label: 'Entity', value: selectedEntity },
    { label: 'Date of Data', value: surveyResponse?.data_date },
    { label: 'Approval Required', value: surveyResponse?.approval_required },
  ];
  const existingAndNewAnswers = { ...existingAnswers, ...updatedAnswers };

  const handleAnswerChange = (questionCode, newValue) => {
    setUpdatedAnswers({ ...updatedAnswers, [questionCode]: newValue });
    onChange({ ...existingAnswers, ...updatedAnswers });
  };

  return (
    <div>
      {currentScreenNumber > 0 && <SectionHeader>Answers</SectionHeader>}
      <SectionContent>
        {currentScreenNumber === 0
          ? editableResponseFields.map(field => {
              if (field.label === 'Entity') {
                return (
                  <Autocomplete
                    value={selectedEntity}
                    label="Entity"
                    options={limitedLocations}
                    getOptionSelected={(option, selected) => {
                      return option.id === selected.id;
                    }}
                    getOptionLabel={option => option.name}
                    isLoading={entityIsLoading}
                    onChangeSelection={(event, selectedValue) => {
                      onChange('entity_id', selectedValue.id);
                      setSelectedEntity(selectedValue);
                    }}
                    onChangeSearchTerm={setEntitySearchTerm}
                    searchTerm={entitySearchTerm}
                    placeholder="type to search"
                    optionLabelKey="entity-name"
                  />
                );
              }
              if (field.label === 'Date of Data') {
                return (
                  <DatePicker
                    label="Date Of Data"
                    name="dataTime"
                    value={existingAndNewFields.data_time}
                    required
                    onChange={UTCDate => {
                      onChange('data_time', UTCDate);
                      setUpdatedFields({ ...updatedFields, data_time: UTCDate });
                    }}
                  />
                );
              }
              return (
                <Select
                  id="approval-status"
                  label="Approval Status"
                  name="approvalStatus"
                  required
                  options={approvalStatusOptions}
                  onChange={event => {
                    onChange('approval_status', event.target.value);
                    setUpdatedFields({ ...updatedFields, approval_status: event.target.value });
                  }}
                  value={existingAndNewFields.approval_status}
                />
              );
            })
          : screen &&
            screen.survey_screen_components.map(component => {
              if (component.question.type === 'Instruction') {
                return (
                  <div>
                    <p style={{ margin: 0 }}>
                      <b>Instruction</b>
                    </p>
                    <p style={{ margin: 0, paddingTop: 5, paddingBottom: 5 }}>
                      {component.question.text}
                    </p>
                  </div>
                );
              }

              if (component.question.type === 'PrimaryEntity') {
                return (
                  <StyledTextField
                    label={component.question.name}
                    name="entity"
                    value={selectedEntity.name}
                    disabled
                    error={false}
                    helperText={false}
                    key={`question-field-${component.question.code}`}
                  />
                );
              }
              return (
                <StyledTextField
                  label={component.question.name}
                  name="date"
                  value={existingAndNewAnswers[component.question.code]}
                  error={false}
                  helperText={false}
                  onChange={event =>
                    handleAnswerChange(component.question.code, event.target.value.trim())
                  }
                  key={`question-field-${component.question.code}`}
                />
              );
            })}
      </SectionContent>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingRight: '1.875rem',
          marginBottom: 25,
        }}
      >
        <Button
          variant="outlined"
          color="default"
          onClick={() => {
            if (currentScreenNumber === 0) {
              setCurrentScreenNumber(1);
            } else {
              setCurrentScreenNumber(0);
            }
          }}
        >
          {currentScreenNumber === 0 ? 'View answers' : 'View editable response fields'}
        </Button>
        {currentScreenNumber !== 0 && (
          <Pagination
            count={pageCount}
            page={currentScreenNumber}
            onChange={(event, screenNumber) => setCurrentScreenNumber(screenNumber)}
            hideNextButton={false}
            hidePreviousButton={false}
            variant="outlined"
            shape="rounded"
            size="large"
          />
        )}
      </div>
    </div>
  );
};

SurveyScreens.propTypes = {
  survey: PropTypes.object.isRequired,
  existingAnswers: PropTypes.object.isRequired,
  updatedFields: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedEntity: PropTypes.object.isRequired,
  setSelectedEntity: PropTypes.func.isRequired,
  surveyResponse: PropTypes.object.isRequired,
  existingAndNewFields: PropTypes.object.isRequired,
  setUpdatedFields: PropTypes.func.isRequired,
  currentScreenNumber: PropTypes.number.isRequired,
  setCurrentScreenNumber: PropTypes.func.isRequired,
};
