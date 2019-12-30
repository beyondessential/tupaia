/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { decodeUrl, createUrl } from '../historyNavigation';

describe('history', () => {
  describe('url to state', () => {
    it('should handle an empty url', () => {
      const state = decodeUrl('');

      expect(state).toHaveProperty('organisationUnitCode', 'World');
      expect(state).toHaveProperty('dashboardId', null);
      expect(state).toHaveProperty('reportId', null);
    });

    it('should handle a url with just an org unit', () => {
      const state = decodeUrl('explore/testUnit');

      expect(state).toHaveProperty('organisationUnitCode', 'testUnit');
      expect(state).toHaveProperty('dashboardId', null);
      expect(state).toHaveProperty('reportId', null);
    });

    it('should handle a url with an org unit and a dashboard', () => {
      const state = decodeUrl('explore/testUnit/testDash');

      expect(state).toHaveProperty('organisationUnitCode', 'testUnit');
      expect(state).toHaveProperty('dashboardId', 'testDash');
      expect(state).toHaveProperty('reportId', null);
    });

    it('should handle a url with org unit, dashboard and report', () => {
      const state = decodeUrl('explore/testUnit/testDash/testreport');

      expect(state).toHaveProperty('organisationUnitCode', 'testUnit');
      expect(state).toHaveProperty('dashboardId', 'testDash');
      expect(state).toHaveProperty('reportId', 'testreport');
    });

    it('should handle a url with only a measure', () => {
      const state = decodeUrl('', 'm=5');

      expect(state).toHaveProperty('measureId', '5');
    });

    it('should handle a url with a multimeasure', () => {
      const state = decodeUrl('', 'm=5,10');

      expect(state).toHaveProperty('measureId', '5,10');
    });

    it('should handle a url with a few path items and a measure', () => {
      const state = decodeUrl('explore/testUnit/testDash', 'm=10');

      expect(state).toHaveProperty('dashboardId', 'testDash');
      expect(state).toHaveProperty('measureId', '10');
    });

    it('should handle a password reset', () => {
      const state = decodeUrl('reset-password', 'passwordResetToken=abc123');

      expect(state).toHaveProperty('userPage', 'reset-password');
      expect(state).toHaveProperty('passwordResetToken', 'abc123');
    });

    it('should set view mode correctly', () => {
      expect(decodeUrl('')).toHaveProperty('project', 'explore');
      expect(decodeUrl('explore')).toHaveProperty('project', 'explore');
      expect(decodeUrl('disaster')).toHaveProperty('project', 'disaster');
    });

    it('should handle start and end date parameters', () => {
      const state = decodeUrl('explore', 'startDate=2017-01-01&endDate=2018-01-01');

      expect(state).toHaveProperty('startDate', '2017-01-01');
      expect(state).toHaveProperty('endDate', '2018-01-01');
    });

    it('should handle timezone parameter', () => {
      const state = decodeUrl('explore', 'timeZone=Australia%2FMelbourne');

      expect(state).toHaveProperty('timeZone', 'Australia/Melbourne');
    });
  });

  describe('state to url', () => {
    it('should encode a measure', () => {
      const url = createUrl({
        measureId: 5,
      });

      expect(url.search).toHaveProperty('m', 5);
    });

    it('should allow for a password reset', () => {
      const url = createUrl({
        userPage: 'password-reset',
      });

      expect(url.pathname).toEqual('password-reset');
    });

    it('should create a url for a facility', () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
      });

      expect(url.pathname).toEqual('explore/TS_123');
    });

    it('should create a url for a sub-dashboard', () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
        dashboardId: 'dash',
      });

      expect(url.pathname).toEqual('explore/TS_123/dash');
    });

    it("should leave off the default dashboard parameter if there's no report", () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
        dashboardId: 'General',
      });

      expect(url.pathname).toEqual('explore/TS_123');
    });

    it("should include the default dashboard parameter if there's a report", () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
        dashboardId: 'General',
        reportId: 'report',
      });

      expect(url.pathname).toEqual('explore/TS_123/General/report');
    });

    it('should create a url for a report', () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
        dashboardId: 'dash',
        reportId: 'report',
      });

      expect(url.pathname).toEqual('explore/TS_123/dash/report');
    });

    it('should use the World facility for a report if facility is null', () => {
      const url = createUrl({
        dashboardId: 'dash',
        reportId: 'report',
      });

      expect(url.pathname).toEqual('explore/World/dash/report');
    });

    it('should use default dashboard for a report if necessary', () => {
      const url = createUrl({
        organisationUnitCode: 'TS_123',
        reportId: 'report',
      });

      expect(url.pathname).toEqual('explore/TS_123/General/report');
    });

    it('should create a url for a region', () => {
      const url = createUrl({
        organisationUnitCode: 'TS',
      });

      expect(url.pathname).toEqual('explore/TS');
    });

    it('should create a url for a region with a measure selected', () => {
      const url = createUrl({
        organisationUnitCode: 'TS',
        measureId: 5,
      });

      expect(url.pathname).toEqual('explore/TS');
      expect(url.search).toHaveProperty('m', 5);
    });

    it('should leave off prefix & org unit if World/general is selected', () => {
      const url = createUrl({
        organisationUnitCode: 'World',
      });

      expect(url.pathname).toEqual('');
    });

    it('should include prefix & org unit if World and non default dashboard is selected', () => {
      const url = createUrl({
        orgType: 'region',
        organisationUnitCode: 'World',
        dashboardId: 'Test',
      });

      expect(url.pathname).toEqual('explore/World/Test');
    });

    it('should set view mode correctly', () => {
      expect(
        createUrl({
          project: 'explore',
        }).pathname,
      ).toEqual('');

      expect(
        createUrl({
          project: 'disaster',
        }).pathname,
      ).toEqual('disaster');

      expect(
        createUrl({
          project: 'explore',
          organisationUnitCode: 'DL_123',
        }).pathname,
      ).toEqual('explore/DL_123');

      expect(
        createUrl({
          project: 'disaster',
          organisationUnitCode: 'DL_123',
        }).pathname,
      ).toEqual('disaster/DL_123');
    });

    it('should recognise default dashboard for explore mode', () => {
      expect(
        createUrl({
          project: 'explore',
          dashboardId: 'General',
        }).pathname,
      ).toEqual('');
    });

    it('should not recognise default disaster dashboard in explore mode', () => {
      expect(
        createUrl({
          project: 'explore',
          dashboardId: 'Disaster Response',
        }).pathname,
      ).toEqual('explore/World/Disaster Response');
    });

    it('should recognise default dashboard for disaster modes', () => {
      expect(
        createUrl({
          project: 'disaster',
          dashboardId: 'Disaster Response',
        }).pathname,
      ).toEqual('disaster');
    });

    it('should not recognise default explore dashboard in disaster mode', () => {
      expect(
        createUrl({
          project: 'disaster',
          dashboardId: 'General',
        }).pathname,
      ).toEqual('disaster/World/General');
    });

    it('should allow start and end date parameters to be passed in', () => {
      const url = createUrl({
        startDate: '2017-01-01',
        endDate: '2018-01-01',
      });

      expect(url.search).toHaveProperty('startDate', '2017-01-01');
      expect(url.search).toHaveProperty('endDate', '2018-01-01');
    });

    it('should allow timezone parameter to be passed in', () => {
      const url = createUrl({
        timeZone: 'Australia/Melbourne',
      });

      expect(url.search).toHaveProperty('timeZone', 'Australia/Melbourne');
    });
  });
});
