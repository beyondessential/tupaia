/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SurveyResponsesPage as ResourcePage } from '@tupaia/admin-panel/lib';

export const ApprovedSurveyResponsesView = props => (
  <ResourcePage
    title="Survey Responses (Approved)"
    baseFilter={{ 'survey.code': { comparator: 'ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    {...props}
  />
);

export const DraftSurveyResponsesView = props => (
  <ResourcePage
    title="Survey Responses (Review)"
    baseFilter={{ 'survey.code': { comparator: 'NOT ILIKE', comparisonValue: '%_Confirmed_WNR' } }}
    {...props}
  />
);
