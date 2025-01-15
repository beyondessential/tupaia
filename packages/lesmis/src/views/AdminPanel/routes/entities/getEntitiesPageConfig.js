import { entities, QRCodeColumn } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import { getSurveyResponsePageConfig } from '../surveyResponses/getSurveyResponsePageConfig';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';
import { getImportConfigs } from '../helpers/getImportConfigs';

export const getEntitiesPageConfig = translate => {
  const { baseColumns: SURVEY_RESPONSE_COLUMNS } = getSurveyResponsePageConfig(translate);

  const ENTITIES_COLUMNS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.type'),
      source: 'type',
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    ...ENTITIES_COLUMNS,
    {
      Header: translate('admin.country'),
      source: 'country_code',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        editEndpoint: entities.endpoint,
        title: translate('admin.edit'),
        fields: [
          {
            Header: translate('admin.name'),
            source: 'name',
          },
        ],
      },
    },
    getDeleteColumnConfigs(entities.endpoint, translate),
    QRCodeColumn,
  ];

  const IMPORT_CONFIG = getImportConfigs(translate, entities.importConfig);
  return {
    ...entities,
    label: translate('admin.entities'),
    columns: FIELDS,
    importConfig: IMPORT_CONFIG,
    nestedViews: [
      {
        ...entities.nestedViews[0],
        columns: [
          ...SURVEY_RESPONSE_COLUMNS,
          {
            Header: 'Approval Status',
            source: 'approval_status',
            show: false,
          },
          {
            Header: 'id',
            source: 'id',
            show: false,
          },
        ],
        getNestedViewLink: ({ id, approval_status: approvalStatus }) => {
          if (approvalStatus === 'pending') {
            return `../../survey-responses/${id}/answers`;
          }
          if (approvalStatus === 'not_required') {
            return `../../survey-responses/non-approval/${id}/answers`;
          }
          return `../../survey-responses/${approvalStatus}/${id}/answers`;
        },
      },
    ],
  };
};
