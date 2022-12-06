/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { getBrowserTimeZone } from '@tupaia/utils';
import { getImportConfigs } from './getImportConfigs';
import { getSurveyResponsesExportModal } from '../../components/getSurveyResponsesExportModal';
import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';
import { getDeleteColumnConfigs } from './getDeleteColumnConfigs';
import { getBaseEditorConfigs } from './getEditorConfigs';

const APPROVAL_STATUS_TYPES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Approved', value: 'approved' },
];

export const getSurveyResponsePageConfigs = ({ translate }) => {
  const ColumnFilter = getColumnFilter(translate);

  const surveyName = {
    Header: translate('admin.survey'),
    source: 'survey.name',
    editable: false,
    type: 'tooltip',
    Filter: ColumnFilter,
  };

  const assessorName = {
    Header: translate('admin.assessor'),
    source: 'assessor_name',
    editable: false,
    Filter: ColumnFilter,
  };

  const date = {
    Header: translate('admin.dateOfSurvey'),
    source: 'end_time',
    type: 'tooltip',
    accessor: row => moment(row.end_time).local().format('ddd, MMM Do YYYY, HH:mm:ss ZZ'),
    filterable: false,
    editable: false,
  };

  const dateOfData = {
    Header: translate('admin.dateOfData'),
    source: 'data_time',
    type: 'tooltip',
    accessor: row => moment.parseZone(row.data_time).format('ddd, MMM Do YYYY, HH:mm:ss'),
    filterable: false,
    editConfig: {
      type: 'datetime-utc',
      accessor: record => moment.parseZone(record.data_time).toString(),
    },
  };

  const entityName = {
    Header: translate('admin.entity'),
    source: 'entity.name',
    editConfig: {
      optionsEndpoint: 'entities',
    },
    Filter: ColumnFilter,
  };

  const SURVEY_RESPONSE_COLUMNS = [
    surveyName,
    assessorName,
    date,
    dateOfData,
    {
      Header: translate('admin.export'),
      source: 'id',
      type: 'export',
      actionConfig: {
        exportEndpoint: 'surveyResponses',
        extraQueryParameters: {
          timeZone: getBrowserTimeZone(),
        },
      },
    },
  ];

  const importConfig = getImportConfigs(translate, {
    title: translate('admin.importSurveyResponses'),
    actionConfig: {
      importEndpoint: 'surveyResponses',
      extraQueryParameters: {
        timeZone: getBrowserTimeZone(),
        respondWithEmailTimeout: 10 * 1000, // if an import doesn't finish in 10 seconds, email results
      },
    },
    queryParameters: [
      {
        label: translate('admin.survey'),
        secondaryLabel:
          'Please enter the surveys for the responses to be imported against. Each tab in the file should be a matching survey code. Leave blank to import all tabs.',
        parameterKey: 'surveyCodes',
        optionsEndpoint: 'surveys',
        optionValueKey: 'code',
        allowMultipleValues: true,
      },
    ],
  });

  const exportConfig = {
    exportButtonText: translate('admin.export'),
    cancelButtonText: translate('admin.cancel'),
    isExportingMessage:
      'Export is taking a while, and will continue in the background. You will be emailed the exported file when the process completes.',
  };

  return {
    columns: [
      entityName,
      ...SURVEY_RESPONSE_COLUMNS,
      {
        Header: translate('admin.edit'),
        type: 'edit',
        source: 'id',
        actionConfig: {
          title: translate('admin.edit'),
          editEndpoint: 'surveyResponses',
          fields: [
            entityName,
            surveyName,
            assessorName,
            date,
            dateOfData,
            {
              Header: translate('admin.approvalStatus'),
              source: 'approval_status',
              editConfig: {
                options: APPROVAL_STATUS_TYPES,
              },
            },
          ].map(field => ({ ...field, Header: translate(field.Header) })),
        },
      },
      getDeleteColumnConfigs('surveyResponses', translate),
    ],
    importConfig,
    exportConfig,
    editorConfig: getBaseEditorConfigs(translate),
    ExportModalComponent: getSurveyResponsesExportModal(translate),
    SURVEY_RESPONSE_COLUMNS,
  };
};
