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
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const surveysTabRoutes = {
  label: 'Surveys',
  path: '/surveys',
  exact: true,
  icon: <Assignment />,
  childViews: [
    { ...surveys, scope: SINGLE_PROJECT_SCOPE },
    { ...surveyResponses, scope: SINGLE_PROJECT_SCOPE },
    { ...questions, scope: ALL_PROJECTS_SCOPE },
    { ...optionSets, scope: ALL_PROJECTS_SCOPE },
    { ...dataElements, scope: ALL_PROJECTS_SCOPE },
    { ...dataGroups, scope: ALL_PROJECTS_SCOPE },
    { ...syncGroups, scope: ALL_PROJECTS_SCOPE },
    { ...dataMapping, scope: ALL_PROJECTS_SCOPE },
  ],
};
