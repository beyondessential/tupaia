/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment } from '@material-ui/icons';
import { surveys } from './surveys';
import { questions } from './questions';
import { optionSets } from './optionSets';
import { dataElements } from './dataElements';
import { dataGroups } from './dataGroups';
import { surveyResponses } from './surveyResponses';
import { syncGroups } from './syncGroups';
import { dataMapping } from './dataMapping';

export const surveysTabRoutes = {
  label: 'Surveys',
  url: '/surveys',
  exact: true,
  icon: <Assignment />,
  childViews: [
    surveys,
    questions,
    optionSets,
    dataElements,
    dataGroups,
    surveyResponses,
    syncGroups,
    dataMapping,
  ],
};
