/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';

const getProjectCodeToName = async database => {
  const projects = await database.executeSql(`
    SELECT p.code, e.name FROM project p
    JOIN entity e on e.id = p.entity_id
  `);
  return reduceToDictionary(projects, 'code', 'name');
};

const getDashboardReportIdToGroup = async database => {
  const dashboardGroups = await database.executeSql(`SELECT * from "dashboardGroup"`);

  const reportIdToGroup = {};
  dashboardGroups.forEach(dashboardGroup => {
    dashboardGroup.dashboardReports.forEach(reportId => {
      reportIdToGroup[reportId] = dashboardGroup;
    });
  });
  return reportIdToGroup;
};

/**
 * We generate the least amount of config required to test each report once.
 * 1. For each report, use the first dashboard group that includes it
 * 2. For each dashboard group, use the first project that includes it
 */
export const generateDashboardReportConfig = async database => {
  const dashboardReports = await database.executeSql(
    `SELECT id, "viewJson"->>'name' as name from "dashboardReport"`,
  );
  const reportIdToGroup = await getDashboardReportIdToGroup(database);
  const projectCodeToName = await getProjectCodeToName(database);

  const createConfigEntry = ({ report, dashboardGroup, projectCode }) => ({
    project: projectCodeToName[projectCode],
    dashboardGroup: dashboardGroup.name,
    name: report.name,
  });

  return dashboardReports
    .map(report => {
      const dashboardGroup = reportIdToGroup[report.id];
      if (!dashboardGroup) {
        // The report is not attached to any group, thus it won't be displayed
        return null;
      }
      const [projectCode] = dashboardGroup.projectCodes;
      if (!projectCode) {
        // The group is not attached to any project, thus it won't be displayed
        return null;
      }

      return createConfigEntry({ report, dashboardGroup, projectCode });
    })
    .filter(r => r);
};
