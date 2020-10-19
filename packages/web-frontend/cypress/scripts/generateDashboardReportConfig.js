/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { snake } from 'case';

import orgUnitMap from '../config/orgUnitMap.json';
import { CONFIG_ROOT } from '../constants';

const ORG_UNIT_MAP_PATH = `${CONFIG_ROOT}/orgUnitMap.json`;

const WARNING_TYPES = {
  NO_GROUP: 'noGroup',
  NO_PROJECT: 'noProject',
  NO_ORG_UNIT_MAP_ENTRY: 'noOrgUnitMapEntry',
};

const WARNING_TYPE_TO_MESSAGE = {
  [WARNING_TYPES.NO_GROUP]: 'not attached to any dashboard group',
  [WARNING_TYPES.NO_PROJECT]: 'not attached to any projects',
  [WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY]: `no valid org unit map entry found in '${ORG_UNIT_MAP_PATH}'`,
};

const logWarningsForSkippedReports = (logger, skippedReportsByWarnType) => {
  Object.entries(skippedReportsByWarnType).forEach(([warnType, reportIds]) => {
    if (reportIds.length === 0) {
      return;
    }
    const message = WARNING_TYPE_TO_MESSAGE[warnType];
    if (!message) {
      throw new Error(`Dev error: no message defined for warning category: '${warnType}'`);
    }
    logger.warn(`Skipping the following reports - ${message}:`);
    reportIds.sort().forEach(reportId => {
      logger.warn(`  ${reportId}`);
    });
  });
};

const createUrl = (report, urlParams) => {
  const { projectCode, orgUnitCode, dashboardGroup } = urlParams;
  return `/${projectCode}/${orgUnitCode}/${dashboardGroup.name}?report=${report.id}`;
};

const selectUrlParams = dashboardGroups => {
  for (const dashboardGroup of dashboardGroups) {
    const {
      organisationUnitCode: dashboardOrgUnitCode,
      organisationLevel: dashboardLevel,
    } = dashboardGroup;

    const level = snake(dashboardLevel);
    const orgUnitCode = orgUnitMap?.[dashboardOrgUnitCode]?.[level];
    const [projectCode] = dashboardGroup.projectCodes;

    if (orgUnitCode && projectCode) {
      return { dashboardGroup, orgUnitCode, projectCode };
    }
  }

  return undefined;
};

const getUrlsForReports = (reports, reportIdToGroups) => {
  const skippedReports = {
    [WARNING_TYPES.NO_GROUP]: [],
    [WARNING_TYPES.NO_PROJECT]: [],
    [WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY]: [],
  };

  const urls = reports
    .map(report => {
      const groupsForReport = reportIdToGroups[report.id];
      if (!groupsForReport) {
        skippedReports[WARNING_TYPES.NO_GROUP].push(report.id);
        return null;
      }
      if (!groupsForReport.some(dg => dg.projectCodes)) {
        skippedReports[WARNING_TYPES.NO_PROJECT].push(report.id);
        return null;
      }
      const urlParams = selectUrlParams(groupsForReport);
      if (!urlParams) {
        skippedReports[WARNING_TYPES.NO_ORG_UNIT_MAP_ENTRY].push(report.id);
        return null;
      }

      return createUrl(report, urlParams);
    })
    .filter(u => u)
    .sort();

  return { urls, skippedReports };
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
  logger.verbose('Generating dashboard report config...');

  const reports = await database.executeSql(
    `SELECT id, "viewJson"->>'name' as name from "dashboardReport"`,
  );
  const reportIdToGroups = await getDashboardReportIdToGroups(database);
  const { urls, skippedReports } = getUrlsForReports(reports, reportIdToGroups);
  logWarningsForSkippedReports(logger, skippedReports);
  logger.info(`Report urls created: ${urls.length}, skipped: ${reports.length - urls.length}`);

  return urls;
};
