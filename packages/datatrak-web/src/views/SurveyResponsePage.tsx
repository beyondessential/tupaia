/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { ScrollableBody } from '../layout';
import { useSurveyResponse } from '../api/queries';
import { SurveyReviewSection, SurveyScreenHeader } from '../features/Survey/Components';

export const SurveyResponsePage = () => {
  const { surveyResponseId } = useParams();
  const formContext = useFormContext();
  const { data: surveyResponse } = useSurveyResponse(surveyResponseId);
  const answers = surveyResponse?.answers || {};

  useEffect(() => {
    if (answers) {
      formContext.reset(answers);
    }
  }, [JSON.stringify(answers)]);

  const description = `${surveyResponse?.entityName} | ${surveyResponse?.countryName} ${surveyResponse?.dataTime}`;

  return (
    <>
      <SurveyScreenHeader heading={surveyResponse?.surveyName} description={description} />
      <ScrollableBody>
        <SurveyReviewSection />
      </ScrollableBody>
      {/*<FormActions>*/}
      {/*  <Button>Close</Button>*/}
      {/*</FormActions>*/}
    </>
  );
};
