/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { snake } from 'case';

import { filterEntities, filterValues, toArray } from '@tupaia/utils';
import orgUnitMap from '../config/orgUnitMap.json';
import { CONFIG_ROOT } from '../constants';

const ORG_UNIT_MAP_PATH = `${CONFIG_ROOT}/orgUnitMap.json`;

const WARNING_TYPES = {
  NO_GROUP: 'noGroup',
  NO_PROJECT: 'noProject',
  NO_ORG_UNIT_MAP_ENTRY: 'noOrgUnitMapEntry',
};

const WARNING_TYPE_TO_MESSAGE = {
  [WARNING_TYPES.DRILL_DOWN]: `Drill down levels are not supported`,
  [WARNING_TYPES.NO_GROUP]: 'Not attached to any dashboard group',
  [WARNING_TYPES.NO_PROJECT]: 'Not attached to any projects',
  [WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY]: `No compatible org unit map entry found in '${ORG_UNIT_MAP_PATH}'`,
};

const logWarningsForSkippedReports = (logger, skippedReports) => {
  logger.warn(`Skipping the following reports:`);
  Object.entries(skippedReports).forEach(([warnType, reportIds]) => {
    const message = WARNING_TYPE_TO_MESSAGE[warnType];
    if (!message) {
      throw new Error(`Dev error: no message defined for warning category: '${warnType}'`);
    }
    logger.warn(`* ${message}:`);
    reportIds.sort().forEach(reportId => {
      logger.warn(`  ${reportId}`);
    });
  });
};

const createUrl = (report, urlParams) => {
  const { projectCode, orgUnitCode, dashboardGroup } = urlParams;
  return `/${projectCode}/${orgUnitCode}/${dashboardGroup.name}?report=${report.id}`;
};

/**
 * @returns {string|undefined}
 */
const selectOrgUnitCode = async (database, orgUnitCodes, entityConditions) => {
  if (orgUnitCodes.length === 0 || !entityConditions) {
    return orgUnitCodes[0];
  }

  const entities = await database.executeSql(
    `SELECT * FROM entity WHERE code IN (${orgUnitCodes.map(() => '?').join(',')})`,
    orgUnitCodes,
  );
  return filterEntities(entities, entityConditions)[0]?.code;
};

const selectUrlParams = async (database, report, dashboardGroups) => {
  const { viewJson } = report;

  for (const dashboardGroup of dashboardGroups) {
    const {
      organisationUnitCode: dashboardOrgUnitCode,
      organisationLevel: dashboardLevel,
    } = dashboardGroup;

    const level = snake(dashboardLevel);
    const orgUnitCodes = toArray(orgUnitMap?.[dashboardOrgUnitCode]?.[level]);
    const orgUnitCode = await selectOrgUnitCode(
      database,
      orgUnitCodes,
      (viewJson || {}).displayOnEntityConditions,
    );
    const [projectCode] = dashboardGroup.projectCodes;

    if (orgUnitCode && projectCode) {
      return { dashboardGroup, orgUnitCode, projectCode };
    }
  }

  return undefined;
};

const getUrlsForReports = async (database, reports, reportIdToGroups) => {
  const skippedReports = {
    [WARNING_TYPES.DRILL_DOWN]: [],
    [WARNING_TYPES.NO_GROUP]: [],
    [WARNING_TYPES.NO_PROJECT]: [],
    [WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY]: [],
  };

  const getUrlForReport = async report => {
    const { drillDownLevel } = report;
    if (drillDownLevel) {
      skippedReports[WARNING_TYPES.DRILL_DOWN].push(`${report.id} - level ${drillDownLevel}`);
      return null;
    }
    const groupsForReport = reportIdToGroups[report.id];
    if (!groupsForReport) {
      skippedReports[WARNING_TYPES.NO_GROUP].push(report.id);
      return null;
    }
    if (!groupsForReport.some(dg => dg.projectCodes)) {
      skippedReports[WARNING_TYPES.NO_PROJECT].push(report.id);
      return null;
    }
    const urlParams = await selectUrlParams(database, report, groupsForReport);
    if (!urlParams) {
      skippedReports[WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY].push(report.id);
      return null;
    }

    return createUrl(report, urlParams);
  };

  const urls = await Promise.all(reports.map(getUrlForReport));
  const validUrls = urls.filter(u => u).sort();
  return {
    urls: validUrls,
    skippedReports: filterValues(skippedReports, r => r.length > 0),
  };
};

const getDashboardReportIdToGroups = async database => {
  const dashboardGroups = await database.executeSql(`SELECT * from "dashboardGroup"`);

  const reportIdToGroups = {};
  dashboardGroups.forEach(dashboardGroup => {
    dashboardGroup.dashboardReports.forEach(reportId => {
      if (!reportIdToGroups[reportId]) {
        reportIdToGroups[reportId] = [];
      }
      reportIdToGroups[reportId].push(dashboardGroup);
    });
  });
  return reportIdToGroups;
};

/**
 * We generate the least amount of config required to test each report once.
 * 1. For each report, use the last dashboard group that includes it
 * 2. For each dashboard group, use the first project that includes it
 * 3. For each dashboard group, use an organisation unit from the orgUnitMap config
 * that matches the group's org unit code and level
 */
export const generateDashboardReportConfig = async ({ database, logger }) => {
  const reports = await database.executeSql('SELECT * from "dashboardReport"');
  const reportIdToGroups = await getDashboardReportIdToGroups(database);
  const { urls, skippedReports } = await getUrlsForReports(database, reports, reportIdToGroups);
  const skippedReportsExist = Object.keys(skippedReports).length > 0;
  if (skippedReportsExist) {
    logWarningsForSkippedReports(logger, skippedReports);
  }
  logger.info(`Report urls created: ${urls.length}, skipped: ${reports.length - urls.length}`);

  return urls;
};
