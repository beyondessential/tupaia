/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FlexColumn, SurveyQuestion } from '../components';
import { useSurvey } from '../api/queries/useSurvey';
import { useForm } from 'react-hook-form';

const Container = styled(FlexColumn)`
  padding: 1rem;
  background: white;
`;

const FormContainer = styled.div`
  margin-top: 2rem;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
`;

const SurveyForm = ({ survey }) => {
  const { handleSubmit, register, errors } = useForm();

  const onSubmitSurvey = data => {
    console.log('submit survey data', data);
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit(onSubmitSurvey)} noValidate>
        {survey.map(question => {
          console.log('question', question);
          return (
            <SurveyQuestion
              key={question.question_id}
              id={question.question_id}
              code={question['question.code']}
              name={question['question.name']}
              type={question['question.type']}
              text={question['question.text']}
              options={question['question.options']}
              config={question.config}
              label={question.question_label || question['question.name']}
            />
          );
        })}
      </form>
    </FormContainer>
  );
};

export const SurveyView = () => {
  let { projectId, countryId, surveyId, entityId } = useParams();
  const survey = useSurvey();
  return (
    <Container>
      <Title>Survey View</Title>
      <div>Project: {projectId}</div>
      <div>Country: {countryId}</div>
      <div>Survey: {surveyId}</div>
      <div>Entity: {entityId}</div>
      <SurveyForm survey={survey} />
    </Container>
  );
};
