/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Select, TextField, FetchLoader } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ApprovalStatus } from '@tupaia/types';
import { lower } from 'case';
// import { Autocomplete } from '../autocomplete';
// import { useEntities } from '../VizBuilderApp/api';
// import { useDebounce } from '../utilities';
import { DatePicker } from '../dataTables/components/PreviewFilters/filters/DatePicker';
import { useSurveyResponseAnswers } from '../api/queries/useSurveyResponses';
import { useSurveyScreenComponents } from '../api/queries/useSurveyScreenComponents';
import { useQuestions } from '../api/queries/useQuestions';
import { InputField } from '../widgets';

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
`;

const SectionHeader = styled(Typography)`
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.25rem;
  padding-bottom: 1.25rem;
`;

const approvalStatusOptions = Object.values(ApprovalStatus).map(type => ({
  label: type,
  value: type,
}));

const getInputTypeFromQuestionType = questionType => {
  const type = lower(questionType, '');
  console.log('type', type);
  if (
    [
      'arithmatic',
      'binary',
      'codegenerator',
      'condition',
      'dateOfData',
      'entity',
      'freetext',
      'geolocate',
      'number',
      'primaryentity',
      'submissiondate',
      'file',
      'photo',
    ].includes(type)
  ) {
    return 'text';
  }
  return type;
};

export const SurveyResponseEditFields = ({ endpoint, onEditField, recordData, isLoading }) => {
  if (isLoading) {
    return <div />;
  }

  const [, surveyResponseId] = endpoint.split('/');
  const answers = useSurveyResponseAnswers(surveyResponseId);

  const { data: screenComponentsData } = useSurveyScreenComponents(recordData['survey.id']);

  console.log('screen component data', screenComponentsData);

  const getInputValue = questionId => {
    if (!answers.data) {
      return undefined;
    }
    if (!answers.data.find(answer => answer.question_id === questionId)) {
      return undefined;
    }
    return answers.data.find(answer => answer.question_id === questionId).text;
  };

  const { isLoading: questionsIsLoading, isError, error, data: questionsData } = useQuestions(
    screenComponentsData,
  );

  // const initialState = recordData['entity.name'];
  // const [entitySearchTerm, setEntitySearchTerm] = useState('');
  // const debouncedSearchTerm = useDebounce(entitySearchTerm, 100);
  // const [selectedEntity, setSelectedEntity] = useState(initialState);
  const [selectedDate, setSelectedDate] = useState(recordData?.data_time);
  // const { data: entities = [], isLoading: entityIsLoading } = useEntities(debouncedSearchTerm);
  // const limitedLocations = entities.slice(0, 20);

  return (
    <div>
      <SectionWrapper>
        <TextField
          value={recordData['entity.name']}
          label="Entity"
          getOptionSelected={(option, selected) => {
            return option.code === selected.code;
          }}
          getOptionLabel={option => option.name}
          disabled
        />
        <TextField
          label="Survey"
          name="surveyName"
          value={recordData['survey.name']}
          disabled
          error={false}
          helperText={false}
          onChange={event => onEditField('code', event.target.value.trim())}
        />
        <TextField
          label="Assessor"
          name="surveyName"
          value={recordData?.assessor_name}
          disabled
          error={false}
          helperText={false}
          onChange={event => onEditField('code', event.target.value.trim())}
        />
        <TextField
          label="Date of Survey"
          name="date"
          value={recordData?.end_time}
          disabled
          error={false}
          helperText={false}
          onChange={event => onEditField('code', event.target.value.trim())}
        />
        <DatePicker
          name="Date of Data"
          value={selectedDate}
          required
          onChange={UTCDate => {
            setSelectedDate(UTCDate);
            onEditField('data_time', UTCDate);
          }}
        />
        <Select
          id="approval-status"
          label="Approval Status"
          name="approvalStatus"
          required
          options={approvalStatusOptions}
          onChange={event => onEditField('approvalStatus', event.target.value)}
          value={recordData?.type}
        />
      </SectionWrapper>
      <SectionHeader>Resubmit survey response</SectionHeader>
      <FetchLoader
        isLoading={isLoading || questionsIsLoading}
        isError={isError}
        error={error}
        noDataMessage="No Data Found"
      >
        <SectionWrapper>
          {questionsData &&
            questionsData
              .filter(question => question.type !== 'Instruction')
              .map(question => {
                return (
                  <InputField
                    label={question.text}
                    type={getInputTypeFromQuestionType(question.type)}
                    id={`${question}-trial`}
                    inputKey={`answer-${question}`}
                    options={question.options}
                    value={getInputValue(question.id)}
                    optionsEndpoint={question.type === 'PrimaryEntity' && 'entities'}
                    onChange={event => onEditField(question.id, event.target.value)}
                  />
                );
              })}
        </SectionWrapper>
      </FetchLoader>
    </div>
  );
};

SurveyResponseEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  endpoint: PropTypes.string.isRequired,
};
