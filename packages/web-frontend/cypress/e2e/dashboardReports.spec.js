/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  closeOpenDialogs,
  expandDashboardItem,
  preserveUserSession,
  selectDashboardGroup,
  selectProject,
} from '../support';
import { REPORTS } from '../fixtures/reports';

/**
 * This is a workaround in case a dashboard is left open due to a previous test failing
 * Normally we would close the dashboard anyway using an `after` block,
 * but this is not currently possible due to a Cypress bug
 *
 * @see https://github.com/cypress-io/cypress/issues/2831
 */
const closeDialogsBecauseOfCypressBug = () => {
  closeOpenDialogs();
};

describe('Dashboard reports', () => {
  const testReportsForProject = (project, reports) => {
    describe(`Project: ${project}`, () => {
      const reportsByGroup = Cypress._.groupBy(reports, 'dashboardGroup');

      before(() => {
        cy.server();
        cy.route(/\/dashboard/).as('dashboard');

        closeDialogsBecauseOfCypressBug();
        selectProject(project);
        cy.wait('@dashboard');
      });

      Object.entries(reportsByGroup).forEach(([groupName, reportsForGroup]) =>
        testReportsForGroup(groupName, reportsForGroup),
      );
    });
  };

  const testReportsForGroup = (groupName, reports) => {
    describe(`Group: ${groupName}`, () => {
      before(() => {
        closeDialogsBecauseOfCypressBug();
        selectDashboardGroup(groupName);
      });

      reports.forEach(testReport);
    });
  };

  const testReport = report => {
    describe(report.name, () => {
      before(() => {
        closeDialogsBecauseOfCypressBug();
        expandDashboardItem(report.name);
      });

      it('enlarged dialog', () => {
        cy.findByTestId('enlarged-dialog').snapshot({ name: 'html' });
      });
    });
  };

  const reportsByProject = Cypress._.groupBy(REPORTS, 'project');

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    preserveUserSession();
  });

  Object.entries(reportsByProject).forEach(([project, reports]) => {
    testReportsForProject(project, reports);
  });
});
