/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SurveyResponsesPage as ResourcePage } from '@tupaia/admin-panel/lib';

export const SurveyResponsesPage = props => (
  <ResourcePage
    title="Survey Responses (Approved)"
    baseFilter={{ assessor_name: { comparisonValue: 'tupou taufa' } }}
    {...props}
  />
);
