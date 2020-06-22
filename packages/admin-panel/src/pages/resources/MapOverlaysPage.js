import React from 'react';
import { ResourcePage } from './ResourcePage';
import { prettyJSON, prettyArray } from '../../utilities/pretty';

const FIELDS = [
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Group Name',
    source: 'groupName',
  },
  {
    Header: 'User Group',
    source: 'userGroup',
  },
  {
    Header: 'Data Element Code',
    source: 'dataElementCode',
  },
  {
    Header: 'Display Type',
    source: 'displayType',
  },
  {
    Header: 'Custom Colors',
    source: 'customColors',
  },
  {
    Header: 'isDataRegional',
    source: 'isDataRegional',
    type: 'boolean',
  },
  {
    Header: 'Values',
    source: 'values',
    Cell: ({ original: { values } }) => prettyJSON(values),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Hide From Menu',
    source: 'hideFromMenu',
    type: 'boolean',
  },
  {
    Header: 'Hide From Popup',
    source: 'hideFromPopup',
    type: 'boolean',
  },
  {
    Header: 'Hide From Legend',
    source: 'hideFromLegend',
    type: 'boolean',
  },
  {
    Header: 'Linked Measures',
    source: 'linkedMeasures',
    Cell: ({ original: { linkedMeasures } }) => prettyArray(linkedMeasures),
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'id',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Sort Order',
    source: 'sortOrder',
  },
  {
    Header: 'Measure Builder Config',
    source: 'measureBuilderConfig',
    Cell: ({ original: { measureBuilderConfig } }) => prettyJSON(measureBuilderConfig),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Measure Builder',
    source: 'measureBuilder',
  },
  {
    Header: 'Presentation Options',
    source: 'presentationOptions',
    Cell: ({ value }) => prettyJSON(value),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Country Codes',
    source: 'countryCodes',
    Cell: ({ original: { countryCodes } }) => prettyArray(countryCodes),
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
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
      editEndpoint: 'mapOverlays',
      fields: [...FIELDS],
    },
  },
];

export const MapOverlaysPage = () => (
  <ResourcePage
    title="Map Overlays"
    endpoint="mapOverlays"
    columns={COLUMNS}
    editConfig={{
      title: 'Edit Map Overlay',
    }}
  />
);
