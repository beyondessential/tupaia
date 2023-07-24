/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React, { useState } from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import { Pagination } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { TextField } from '@tupaia/ui-components';
import { FileQuestionField } from './FileQuestionField';

const SectionContent = styled.div`
  padding: 2rem 1rem 0.5rem 1rem;
`;

const SectionHeader = styled(Typography)`
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.25rem;
  padding-bottom: 0.5rem;
  padding-top: 1.5rem;
`;

const InstructionHeader = styled(Typography)`
  margin: 0;
`;

const InstructionText = styled(Typography)`
  margin: 0;
  padding: 5px 0px 25px 0px;
`;

export const SurveyScreens = ({
  survey,
  existingAnswers,
  onChange,
  onSetFormFile,
  selectedEntity,
  fields,
}) => {
  const [updatedAnswers, setUpdatedAnswers] = useState({});
  const [currentScreenNumber, setCurrentScreenNumber] = useState(1);

  const pageCount = survey?.surveyQuestions?.length;
  const screen = survey?.surveyQuestions?.find(
    ({ screen_number }) => screen_number === currentScreenNumber,
  );

  const existingAndNewAnswers = { ...existingAnswers, ...updatedAnswers };

  const handleAnswerChange = (questionCode, newValue) => {
    const valueToSet = newValue === '' ? null : newValue; // Blanking an answer means deleting it, send null instead of empty string
    const newAnswers = { ...updatedAnswers, [questionCode]: valueToSet };
    setUpdatedAnswers(newAnswers);
    onChange('answers', newAnswers);
  };

  const handleFileAnswerChange = (questionCode, uniqueFileName, file) => {
    if (file) {
      onSetFormFile(questionCode, file);
      handleAnswerChange(questionCode, uniqueFileName);
    } else {
      onSetFormFile(questionCode, null);
      handleAnswerChange(questionCode, null);
    }
  };

  const renderSurveyScreenComponent = component => {
    if (component.question.type === 'Instruction') {
      return (
        <div>
          <InstructionHeader variant="body2">
            <b>Instruction</b>
          </InstructionHeader>
          <InstructionText variant="body2">{component.question.text}</InstructionText>
        </div>
      );
    }

    if (component.question.type === 'PrimaryEntity') {
      return (
        <TextField
          label={component.question.name}
          value={selectedEntity.name}
          disabled
          key={`question-field-${component.question.code}`}
        />
      );
    }

    if (component.question.type === 'File') {
      return (
        <FileQuestionField
          key={`question-field-${component.question.code}`}
          label={component.question.name}
          value={existingAndNewAnswers[component.question.code]}
          onChange={({ uniqueFileName, file }) =>
            handleFileAnswerChange(component.question.code, uniqueFileName, file)
          }
        />
      );
    }

    if (component.question.type === 'SubmissionDate' || component.question.type === 'DateOfData') {
      const formattedDate =
        typeof fields.data_time === 'object'
          ? format(fields.data_time, 'yyyy/MM/dd hh:mmaaa')
          : format(new Date(fields.data_time), 'dd/MM/yyyy hh:mmaaa');

      return (
        <TextField
          label={component.question.name}
          name="dateOfData"
          value={formattedDate}
          disabled
          error={false}
          helperText={false}
          key={`question-field-${component.question.code}`}
        />
      );
    }

    return (
      <TextField
        label={component.question.name}
        value={existingAndNewAnswers[component.question.code]}
        onChange={event => handleAnswerChange(component.question.code, event.target.value.trim())}
        key={`question-field-${component.question.code}`}
      />
    );
  };

  return (
    <div>
      <SectionHeader>Answers</SectionHeader>
      <SectionContent>
        {screen &&
          screen.survey_screen_components.map(component => renderSurveyScreenComponent(component))}
      </SectionContent>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingRight: '1.875rem',
          marginBottom: 25,
        }}
      >
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
      </div>
    </div>
  );
};

SurveyScreens.propTypes = {
  survey: PropTypes.object.isRequired,
  existingAnswers: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSetFormFile: PropTypes.func.isRequired,
  selectedEntity: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
