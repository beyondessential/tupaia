import React from 'react';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities/pretty';

const FIELDS = [
  {
    Header: 'Organisation Level',
    source: 'organisationLevel',
  },
  {
    Header: 'User Group',
    source: 'userGroup',
  },
  {
    Header: 'Organisation Unit Code',
    source: 'organisationUnitCode',
  },
  {
    Header: 'Dashboard Reports',
    source: 'dashboardReports',
    Cell: ({ original: { dashboardReports } }) => prettyArray(dashboardReports),
    editConfig: {
      optionsEndpoint: 'dashboardReports',
      optionLabelKey: 'id',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Project Codes',
    source: 'projectCodes',
    Cell: ({ original: { projectCodes } }) => prettyArray(projectCodes),
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'dashboardGroups',
      fields: [...FIELDS],
    },
  },
];

export const DashboardGroupsPage = () => (
  <ResourcePage
    title="Dashboard Groups"
    endpoint="dashboardGroups"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Dashboard Group',
    }}
  />
);
