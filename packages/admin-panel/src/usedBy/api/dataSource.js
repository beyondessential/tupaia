const DATA_SOURCE_TYPES = {
  DATA_ELEMENT: 'dataElement',
  DATA_GROUP: 'dataGroup',
  DATA_TABLE: 'dataTable',
};

/**
 *
 * @param {string} recordType
 * @param {string} dataSourceCode
 * @returns {object} - query object to be used in the report query
 *
 * @description The report query is used to find the reports that use a data source. The query is different for each record type, because the subkey and the shape of the value is different for each record type. This way we avoid partial matches and false positives.
 */
const getReportQuery = (recordType, dataSourceCode) => {
  switch (recordType) {
    case DATA_SOURCE_TYPES.DATA_TABLE: {
      //  specifically look for the dataTableCode in the transform array
      return {
        'config->transform': {
          comparator: '@>',
          comparisonValue: `[{"dataTableCode": "${dataSourceCode}"}]`,
        },
      };
    }
    case DATA_SOURCE_TYPES.DATA_ELEMENT: {
      return {
        'config->transform': {
          // specifically look for the data element code in the parameters.dataElementCodes array
          comparator: '@>',
          comparisonValue: `[{"parameters": {"dataElementCodes": ["${dataSourceCode}"]}}]`,
        },
      };
    }
    case DATA_SOURCE_TYPES.DATA_GROUP: {
      return {
        'config->transform': {
          // specifically look for the data group code in parameters.dataGroupCode value
          comparator: '@>',
          comparisonValue: `[{"parameters": {"dataGroupCode": "${dataSourceCode}"}}]`,
        },
      };
    }
    default: {
      throw new Error(`Unknown record type: ${recordType}`);
    }
  }
};

const VISUALISATIONS_BASE_URL = '/visualisations';

const getDataGroupsUsedBy = async (api, recordId) => {
  const dataElementDataGroupResponse = await api.get('dataElementDataGroups', {
    filter: JSON.stringify({
      data_element_id: recordId,
    }),
  });

  const dataGroupsResponse = await api.get('dataGroups', {
    filter: JSON.stringify({
      id: dataElementDataGroupResponse.body.map(dedg => dedg.data_group_id),
    }),
  });

  return dataGroupsResponse.body.map(dataGroup => ({
    type: DATA_SOURCE_TYPES.DATA_GROUP,
    name: dataGroup.code,
    url: `/surveys/data-groups?filters=${encodeURIComponent(
      JSON.stringify([{ id: 'code', value: dataGroup.code }]),
    )}`,
  }));
};

const getReportCodesUsedBy = async (api, recordType, dataSourceCode) => {
  const reportQuery = getReportQuery(recordType, dataSourceCode);
  const reportsResponse = await api.get('reports', {
    filter: JSON.stringify(reportQuery),
  });

  return reportsResponse.body.map(report => report.code);
};

const getLegacyReportsUsedBy = async (api, dataSourceCode) => {
  const legacyReportsResponse = await api.get('legacyReports', {
    filter: JSON.stringify({
      data_builder_config: {
        comparator: 'like',
        comparisonValue: `%${dataSourceCode}%`,
        castAs: 'text',
      },
    }),
  });
  return {
    codes: legacyReportsResponse.body.map(legacyReport => legacyReport.code),
    usedBy: legacyReportsResponse.body.map(legacyReport => ({
      type: 'legacyReport',
      name: legacyReport.code,
      url: `${VISUALISATIONS_BASE_URL}/legacy-reports?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: legacyReport.code }]),
      )}`,
    })),
  };
};

const getMapOverlaysUsedBy = async (api, legacyReportCodes, reportCodes) => {
  const mapOverlaysResponse = await api.get('mapOverlays', {
    filter: JSON.stringify({
      report_code: [...reportCodes, ...legacyReportCodes],
    }),
  });

  return mapOverlaysResponse.body.map(mapOverlay => ({
    type: 'mapOverlay',
    name: mapOverlay.code,
    url: `${VISUALISATIONS_BASE_URL}/map-overlays?filters=${encodeURIComponent(
      JSON.stringify([{ id: 'code', value: mapOverlay.code }]),
    )}`,
  }));
};

const getDashboardItemsUsedBy = async (api, reportCodes, legacyReportCodes) => {
  // query the dashboard items for the exact report code in the dashboard items
  const dashboardItemsResponse = await api.get('dashboardItems', {
    filter: JSON.stringify({
      report_code: [...reportCodes, ...legacyReportCodes],
    }),
  });

  return dashboardItemsResponse.body.map(dashboardItem => ({
    type: 'dashboardItem',
    name: dashboardItem.code,
    url: `${VISUALISATIONS_BASE_URL}?filters=${encodeURIComponent(
      JSON.stringify([{ id: 'code', value: dashboardItem.code }]),
    )}`,
  }));
};

const getIndicatorsUsedBy = async (api, dataSourceCode) => {
  const indicatorsResponse = await api.get('indicators', {
    filter: JSON.stringify({
      config: {
        comparator: 'like',
        comparisonValue: `%${dataSourceCode}%`,
        castAs: 'text',
      },
    }),
  });

  return indicatorsResponse.body.map(indicator => ({
    type: 'indicator',
    name: indicator.code,
    url: `${VISUALISATIONS_BASE_URL}/indicators?filters=${encodeURIComponent(
      JSON.stringify([{ id: 'code', value: indicator.code }]),
    )}`,
  }));
};

const getQuestionsUsedBy = async (api, recordId) => {
  const questionsResponse = await api.get('questions', {
    filter: JSON.stringify({ data_element_id: recordId }),
  });
  return questionsResponse.body.map(question => ({
    type: 'question',
    name: question.name,
    url: `/surveys/questions?filters=${encodeURIComponent(
      JSON.stringify([{ id: 'code', value: question.code }]),
    )}`,
  }));
};

export const getDataSourceUsedBy = async (api, recordType, recordId) => {
  const questionsUsedBy = await getQuestionsUsedBy(api, recordId);

  const dataSource = (await api.get(`${recordType}s/${recordId}`)).body;
  // Only search for data groups if we're looking at a data element
  let dataElementsUsedBy = [];
  if (recordType === DATA_SOURCE_TYPES.DATA_ELEMENT) {
    dataElementsUsedBy = await getDataGroupsUsedBy(api, recordId);
  }

  const reportsUsedByCodes = await getReportCodesUsedBy(api, recordType, dataSource.code);

  const { codes: legacyReportCodes, usedBy: legacyReportUsedBy } = await getLegacyReportsUsedBy(
    api,
    dataSource.code,
  );

  const dashboardItemsUsedBy = await getDashboardItemsUsedBy(
    api,
    reportsUsedByCodes,
    legacyReportCodes,
  );

  const mapOverlaysUsedBy = await getMapOverlaysUsedBy(api, legacyReportCodes, reportsUsedByCodes);

  const indicatorsUsedBy = await getIndicatorsUsedBy(api, dataSource.code);

  return [
    ...questionsUsedBy,
    ...dataElementsUsedBy,
    ...legacyReportUsedBy,
    ...dashboardItemsUsedBy,
    ...mapOverlaysUsedBy,
    ...indicatorsUsedBy,
  ];
};
