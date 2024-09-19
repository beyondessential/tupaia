/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { QuestionType } from '@tupaia/types';
import React from 'react';
import styled from 'styled-components';
import { useAutocompleteOptions, useEntityById } from '../../api';
import { displayDate } from '../../utils';
import { SurveyScreenComponent } from '../../types';
import { Typography } from '@material-ui/core';

const QuestionWrapper = styled.div`
  border-bottom: 1px solid #000;

  & + & {
    margin-block-start: 1.125rem;
  }
`;

const InstructionQuestionText = styled(Typography)`
  font-size: 0.875rem;
  margin-block-start: 2rem;
  margin-block-end: 0.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const QuestionLabel = styled(Typography)`
  font-size: 0.75rem;
  line-height: 1.8;
`;

const SmallText = styled(Typography)`
  font-size: 0.625rem;
`;

const Answer = styled(SmallText)`
  margin-block: 0.8rem 0.3rem;
  margin-inline: 0.25rem;
`;

const useDisplayAnswer = (type, answer, options, optionSetId) => {
  const { data: entity } = useEntityById(answer, {
    enabled: type === QuestionType.Entity || type === QuestionType.PrimaryEntity,
  });
  const { data: optionSet } = useAutocompleteOptions(optionSetId);

  if (type === QuestionType.Instruction) return null;
  if (!answer) return 'No answer';

  // If there are defined options, display the selected option label if set. Usually this is the same as the saved value but not always
  if (options?.length > 0) {
    const selectedOption = options.find(option => option.value === answer);
    return selectedOption?.label ?? answer;
  }
  if (optionSetId) {
    const selectedOption = optionSet?.find(option => option.value === answer);
    return selectedOption?.label ?? answer;
  }

  switch (type) {
    // If the question is an entity question, display the entity name
    case QuestionType.Entity:
    case QuestionType.PrimaryEntity:
      return entity?.name;
    // If the question is a date question, display the date in a readable format
    case QuestionType.Date:
    case QuestionType.DateOfData:
    case QuestionType.SubmissionDate:
      return displayDate(answer);
    // If the question is a geolocate question, display the latitude and longitude
    case QuestionType.Geolocate:
      return `${answer.latitude}, ${answer.longitude} (latitude, longitude)`;
    default:
      return answer;
  }
};

export const Question = ({
  surveyScreenComponent,
  answer,
}: {
  surveyScreenComponent: SurveyScreenComponent;
  answer?: string;
}) => {
  const { type, text, optionSetId, options, detailLabel } = surveyScreenComponent;
  const displayAnswer = useDisplayAnswer(type, answer, options, optionSetId);

  if (type === QuestionType.Instruction) {
    return <InstructionQuestionText>{text}</InstructionQuestionText>;
  }

  return (
    <QuestionWrapper>
      <QuestionLabel>{text}</QuestionLabel>
      <SmallText>{detailLabel}</SmallText>
      {displayAnswer && <Answer>{displayAnswer}</Answer>}
    </QuestionWrapper>
  );
};
