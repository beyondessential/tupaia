import React from 'react';
import { Assignment } from '@material-ui/icons';
import { surveys } from './surveys';
import { questions } from './questions';
import { optionSets } from './optionSets';
import { dataElements } from './dataElements';
import { dataGroups } from './dataGroups';
import { surveyResponses } from './surveyResponses';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

// TUP-3055: Sync Groups and Mappings dropped per refinement.
export const surveysTabRoutes = {
  label: 'Surveys',
  path: '/surveys',
  exact: true,
  icon: <Assignment />,
  childViews: [
    { ...surveys, scope: SINGLE_PROJECT_SCOPE },
    { ...surveyResponses, scope: SINGLE_PROJECT_SCOPE },
    { ...dataElements, scope: ALL_PROJECTS_SCOPE },
    { ...dataGroups, scope: ALL_PROJECTS_SCOPE },
    { ...optionSets, scope: ALL_PROJECTS_SCOPE },
    { ...questions, scope: ALL_PROJECTS_SCOPE },
  ],
};
