/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const getDataSourceUsedBy = async (api, recordType, recordId) => {
  let usedBy = [];
  const questionsResponse = await api.get('questions', {
    filter: JSON.stringify({ data_source_id: recordId }),
  });
  usedBy = [
    ...usedBy,
    ...questionsResponse.body.map(question => ({
      type: 'question',
      name: question.name,
      url: `/surveys/questions?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: question.code }]),
      )}`,
    })),
  ];

  const dataSource = (await api.get(`dataSources/${recordId}`)).body;

  const dataElementDataGroupResponse = await api.get('dataElementDataGroups', {
    filter: JSON.stringify({
      data_element_id: recordId,
    }),
  });

  const dataGroupsResponse = await api.get('dataSources', {
    filter: JSON.stringify({
      id: dataElementDataGroupResponse.body.map(dedg => dedg.data_group_id),
    }),
  });

  usedBy = [
    ...usedBy,
    ...dataGroupsResponse.body.map(dataGroup => ({
      type: 'dataGroup',
      name: dataGroup.code,
      url: `/surveys/data-groups?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: dataGroup.code }]),
      )}`,
    })),
  ];

  const reportsResponse = await api.get('reports', {
    filter: JSON.stringify({
      config: { comparator: 'like', comparisonValue: `%${dataSource.code}%`, castAs: 'text' },
    }),
  });

  const legacyReportsResponse = await api.get('legacyReports', {
    filter: JSON.stringify({
      data_builder_config: {
        comparator: 'like',
        comparisonValue: `%${dataSource.code}%`,
        castAs: 'text',
      },
    }),
  });

  usedBy = [
    ...usedBy,
    ...legacyReportsResponse.body.map(legacyReport => ({
      type: 'legacyReport',
      name: legacyReport.code,
      url: `/dashboard-items/legacy-reports?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: legacyReport.code }]),
      )}`,
    })),
  ];

  const dashboardItemsResponse = await api.get('dashboardItems', {
    filter: JSON.stringify({
      report_code: [
        ...reportsResponse.body.map(report => report.code),
        ...legacyReportsResponse.body.map(legacyReport => legacyReport.code),
      ],
    }),
  });

  usedBy = [
    ...usedBy,
    ...dashboardItemsResponse.body.map(dashboardItem => ({
      type: 'dashboardItem',
      name: dashboardItem.code,
      url: `/dashboard-items?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: dashboardItem.code }]),
      )}`,
    })),
  ];

  const mapOverlaysResponse = await api.get('mapOverlays', {
    filter: JSON.stringify({
      report_code: [
        ...reportsResponse.body.map(report => report.code),
        ...legacyReportsResponse.body.map(legacyReport => legacyReport.code),
      ],
    }),
  });

  usedBy = [
    ...usedBy,
    ...mapOverlaysResponse.body.map(mapOverlay => ({
      type: 'mapOverlay',
      name: mapOverlay.code,
      url: `/dashboard-items/map-overlays?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: mapOverlay.code }]),
      )}`,
    })),
  ];

  const indicatorsResponse = await api.get('indicators', {
    filter: JSON.stringify({
      config: {
        comparator: 'like',
        comparisonValue: `%${dataSource.code}%`,
        castAs: 'text',
      },
    }),
  });

  usedBy = [
    ...usedBy,
    ...indicatorsResponse.body.map(indicator => ({
      type: 'indicator',
      name: indicator.code,
      url: `/dashboard-items/indicators?filters=${encodeURIComponent(
        JSON.stringify([{ id: 'code', value: indicator.code }]),
      )}`,
    })),
  ];

  return usedBy;
};
