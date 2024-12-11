/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { Typography } from '@material-ui/core';
import { useAutocompleteOptions, useEntityById } from '../../api';
import { displayDate, displayDateTime } from '../../utils';
import { SurveyScreenComponent } from '../../types';

type SurveyResponse = DatatrakWebSingleSurveyResponseRequest.ResBody;

const QuestionWrapper = styled.div<{ $border?: boolean }>`
  ${({ $border = true }) => $border && 'border-bottom: 1px solid #ccc;'}
  page-break-inside: avoid;
  max-width: 500px;

  & + & {
    margin-block-start: 1.125rem;
  }
`;

const InstructionQuestionText = styled(Typography)`
  max-width: 500px;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  line-height: 1.5;
`;

const QuestionLabel = styled(Typography)`
  font-size: 0.75rem;
  line-height: 1.5;
`;

const SmallText = styled(Typography)`
  font-size: 0.625rem;
`;

const Answer = styled(SmallText)`
  margin-block: 0.75rem 0.3rem;
`;

const useDisplayAnswer = (
  surveyScreenComponent: SurveyScreenComponent,
  surveyResponse: SurveyResponse,
) => {
  const { id, type, options, optionSetId } = surveyScreenComponent;
  // Extract answer
  const answer = surveyResponse.answers[id!] as any;

  const [urlSearchParams] = useSearchParams();
  const locale = urlSearchParams.get('locale') || 'en-AU';
  const { data: entity } = useEntityById(answer, {
    enabled: type === QuestionType.Entity,
  });
  const { data: optionSet } = useAutocompleteOptions(optionSetId);

  if (type === QuestionType.Instruction) return null;
  if (type === QuestionType.DateOfData) return displayDate(surveyResponse.dataTime, locale);
  if (type === QuestionType.PrimaryEntity) {
    return surveyResponse?.entityName;
  }

  if (!answer) return 'No answer';

  // If there are defined options, display the selected option label if set. Usually this is the same as the saved value but not always
  if (options?.length && options?.length > 0) {
    const selectedOption = options?.find(option => option.value === answer);
    return selectedOption?.label ?? answer;
  }
  if (optionSetId) {
    const selectedOption = optionSet?.find(option => option.value === answer);
    return selectedOption?.label ?? answer;
  }

  switch (type) {
    // If the question is an entity question, display the entity name
    case QuestionType.Entity:
      return entity?.name;
    // If the question is a date question, display the date in a readable format
    case QuestionType.Date:
    case QuestionType.SubmissionDate:
      return displayDate(answer, locale);
    case QuestionType.DateTime:
      return displayDateTime(answer, locale);
    // If the question is a geolocate question, display the latitude and longitude
    case QuestionType.Geolocate: {
      const { latitude, longitude } = JSON.parse(answer);
      return `${latitude}, ${longitude} (latitude, longitude)`;
    }
    case QuestionType.File: {
      // If the value is a file, split the value to get the file name
      const withoutPrefix = answer.split('files/');
      const fileNameParts = withoutPrefix[withoutPrefix.length - 1].split('_');
      // remove first element of the array as it is the file id
      return fileNameParts.slice(1).join('_');
    }
    default:
      return answer;
  }
};

export const Question = ({
  surveyScreenComponent,
  surveyResponse,
}: {
  surveyScreenComponent: SurveyScreenComponent;
  surveyResponse: SurveyResponse;
}) => {
  const { type, text, detailLabel } = surveyScreenComponent;
  const displayAnswer = useDisplayAnswer(surveyScreenComponent, surveyResponse);

  if (type === QuestionType.Instruction) {
    return (
      <QuestionWrapper $border={false}>
        <InstructionQuestionText>{text}</InstructionQuestionText>
        {detailLabel && <SmallText>{detailLabel}</SmallText>}
      </QuestionWrapper>
    );
  }

  return (
    <QuestionWrapper>
      <QuestionLabel>{text}</QuestionLabel>
      {detailLabel && <SmallText>{detailLabel}</SmallText>}
      {displayAnswer && <Answer>{displayAnswer}</Answer>}
    </QuestionWrapper>
  );
};
