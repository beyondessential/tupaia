/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SurveyReviewSection, SurveyScreenHeader } from '../Components';
import { ScrollableBody } from '../../../layout';

export const SurveyReviewScreen = () => {
  return (
    <>
      <SurveyScreenHeader
        heading="Review and submit"
        description="Please review your survey answers below. To edit any answers, please navigate back using the
        'Back' button below. Once submitted, your survey answers will be uploaded to Tupaia."
      />
      <ScrollableBody>
        <SurveyReviewSection />
      </ScrollableBody>
    </>
  );
};
