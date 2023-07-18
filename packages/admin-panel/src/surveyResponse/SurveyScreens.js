/*
 * Tupaia
 * Copyright (c) 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

import React, { useState } from 'react';
import { TextField } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Pagination } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

const StyledTextField = styled(TextField)`
  justify-content: end;
`;

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

export const SurveyScreens = ({ survey, existingAnswers, onChange, selectedEntity }) => {
  const [updatedAnswers, setUpdatedAnswers] = useState({});
  const [currentScreenNumber, setCurrentScreenNumber] = useState(1);

  const pageCount = survey?.surveyQuestions?.length;
  const screen = survey?.surveyQuestions?.find(
    ({ screen_number }) => screen_number === currentScreenNumber,
  );

  const existingAndNewAnswers = { ...existingAnswers, ...updatedAnswers };

  const handleAnswerChange = (questionCode, newValue) => {
    setUpdatedAnswers({ ...updatedAnswers, [questionCode]: newValue });
    onChange('answers', updatedAnswers);
  };

  return (
    <div>
      <SectionHeader>Answers</SectionHeader>
      <SectionContent>
        {screen &&
          screen.survey_screen_components.map(component => {
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
                name="resubmit-text-field"
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
  selectedEntity: PropTypes.object.isRequired,
};
