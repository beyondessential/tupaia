import { Avatar, Typography } from '@material-ui/core';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  DatatrakWebSingleSurveyResponseRequest,
  DatatrakWebSubmitSurveyResponseRequest,
  QuestionType,
} from '@tupaia/types';
import { useAutocompleteOptions, useEntityById } from '../../api';
import { SurveyScreenComponent } from '../../types';
import {
  displayDate,
  displayDateTime,
  formatNumberWithTrueMinus,
  isNonEmptyArray,
  isNullish,
} from '../../utils';

type SurveyResponse = DatatrakWebSingleSurveyResponseRequest.ResBody;

const QuestionWrapper = styled.div`
  border-block-end: 1pt solid #ccc;
  page-break-inside: avoid;
  max-width: 350pt;

  & + & {
    margin-block-start: 1.5rem;
  }
`;

const InstructionQuestionText = styled(Typography)`
  max-width: 350pt;
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

const StyledAvatar = styled(Avatar)`
  width: 8rem;
  height: 8rem;
`;

const useDisplayAnswer = (
  surveyScreenComponent: SurveyScreenComponent,
  surveyResponse: SurveyResponse,
): React.ReactNode => {
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
  if (type === QuestionType.DateOfData || type === QuestionType.SubmissionDate) {
    return displayDate(surveyResponse.dataTime, locale);
  }
  if (type === QuestionType.PrimaryEntity) {
    return surveyResponse?.entityName;
  }

  if (!answer) return <em>No answer</em>;

  // If there are defined options, display the selected option label if set. Usually this is the same as the saved value but not always
  if (isNonEmptyArray(options)) {
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
      return entity?.name;
    // If the question is a date question, display the date in a readable format
    case QuestionType.Date:
      return displayDate(answer, locale);
    case QuestionType.DateTime:
      return displayDateTime(answer, locale);
    // If the question is a geolocate question, display the latitude and longitude
    case QuestionType.Geolocate: {
      try {
        const { latitude, longitude } = JSON.parse(answer);
        if (isNullish(latitude) || isNullish(longitude)) return <em>No answer</em>;
        return (
          <>
            {formatNumberWithTrueMinus(latitude) ?? <em>Unknown latitude</em>},&nbsp;
            {formatNumberWithTrueMinus(longitude) ?? <em>unknown longitude</em>}{' '}
            (latitude,&nbsp;longitude)
          </>
        );
      } catch {
        console.error(`Couldn’t parse Geolocate question answer as JSON: \`${answer}\``);
        return <em>No answer</em>;
      }
    }
    case QuestionType.File: {
      // If the value is a file, split the value to get the file name
      const withoutPrefix = answer.split('files/');
      const fileNameParts = withoutPrefix[withoutPrefix.length - 1].split('_');
      // remove first element of the array as it is the file id
      return fileNameParts.slice(1).join('_');
    }
    case QuestionType.Photo: {
      return <StyledAvatar variant="square" src={answer} />;
    }
    case QuestionType.User:
      return (answer as DatatrakWebSubmitSurveyResponseRequest.UserAnswer).name;
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
      <QuestionWrapper style={{ borderBlockEnd: '0' }}>
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
