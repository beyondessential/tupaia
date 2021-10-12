/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { yup } from '@tupaia/utils';

import {
  draftDashboardItemValidator,
  legacyDashboardItemValidator,
  draftReportValidator,
  legacyReportValidator,
} from '../../../viz-builder/dashboardVisualisation/validators';
import { PreviewMode } from '../../../viz-builder/types';
import { DashboardVisualisationExtractor } from '../../../viz-builder/dashboardVisualisation/DashboardVisualisationExtractor';

describe('DashboardVisualisationExtractor', () => {
  describe('validation', () => {
    it('throws error if viz does not have data field', () => {
      expect(
        () => new DashboardVisualisationExtractor({ presentation: {} }, yup.object(), yup.object()),
      ).toThrow('data is a required field');
    });

    it('throws error if viz does not have presentation field', () => {
      expect(
        () => new DashboardVisualisationExtractor({ data: {} }, yup.object(), yup.object()),
      ).toThrow('presentation is a required field');
    });

    describe('getDraftReport', () => {
      it('throws error if viz does not have data.fetch', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: { transform: [] }, presentation: {} },
            yup.object(),
            draftReportValidator,
          ).getReport(),
        ).toThrow('fetch is a required field');
      });

      it('throws error if viz does not have data.fetch.dataElements or data.fetch.dataGroups', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: { fetch: {}, transform: [] }, presentation: {} },
            yup.object(),
            draftReportValidator,
          ).getReport(),
        ).toThrow('Requires "dataGroups" or "dataElements"');
      });

      it('throws error if viz does not have data.transform', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: { fetch: { dataElements: ['BCD1'] } }, presentation: {} },
            yup.object(),
            draftReportValidator,
          ).getReport(),
        ).toThrow('transform is a required field');
      });

      it('throws error if viz does not have code', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            {
              data: { fetch: { dataElements: ['BCD1'] }, transform: [] },
              presentation: {},
            },
            yup.object(),
            draftReportValidator,
          ).getReport(),
        ).toThrow('Requires "code" for the visualisation');
      });

      it('can get a draft report', () => {
        expect(
          new DashboardVisualisationExtractor(
            {
              code: 'viz',
              data: { fetch: { dataElements: ['BCD1'] }, transform: [] },
              presentation: {},
            },
            yup.object(),
            draftReportValidator,
          ).getReport(),
        ).toEqual({
          code: 'viz',
          config: {
            fetch: {
              dataElements: ['BCD1'],
            },
            transform: [],
          },
        });
      });
    });

    describe('getLegacyReport', () => {
      it('throws error if viz does not have data.config', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: { dataBuilder: 'sumPerOrgUnit' }, presentation: {}, legacy: true },
            yup.object(),
            legacyReportValidator,
          ).getReport(),
        ).toThrow('config is a required field');
      });

      it('throws error if viz does not have data.dataBuilder', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            {
              code: 'viz',
              data: { config: {} },
              presentation: {},
              legacy: true,
            },
            yup.object(),
            legacyReportValidator,
          ).getReport(),
        ).toThrow('dataBuilder is a required field');
      });

      it('can get a legacy report', () => {
        expect(
          new DashboardVisualisationExtractor(
            {
              code: 'viz',
              data: { config: {}, dataBuilder: 'sumPerOrgGroup' },
              presentation: {},
              legacy: true,
            },
            yup.object(),
            legacyReportValidator,
          ).getReport(),
        ).toEqual({
          code: 'viz',
          dataBuilder: 'sumPerOrgGroup',
          config: {},
        });
      });
    });

    describe('getDraftDashboardItem', () => {
      it('throws error if viz does not have presentation.type', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: {}, presentation: {} },
            draftDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toThrow('Requires "type" in chart config');
      });

      it('throws error if viz does not have code', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { data: {}, presentation: { type: 'chart' } },
            draftDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toThrow('Requires "code" for the visualisation');
      });

      it('can get a draft dashboardItem', () => {
        expect(
          new DashboardVisualisationExtractor(
            {
              code: 'viz',
              data: {},
              presentation: { type: 'chart' },
            },
            draftDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toEqual({
          code: 'viz',
          config: {
            type: 'chart',
          },
          reportCode: 'viz',
          legacy: false,
        });
      });
    });

    describe('getLegacyDashboardItem', () => {
      it('throws error if type is not legacy', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: {}, presentation: { type: 'chart' } },
            legacyDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toThrow('legacy must be one of the following values: true');
      });

      it('throws error if viz does not have presentation.type', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { code: 'viz', data: {}, presentation: {}, legacy: true },
            legacyDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toThrow('Requires "type" in chart config');
      });

      it('throws error if viz does not have code', () => {
        expect(() =>
          new DashboardVisualisationExtractor(
            { data: {}, presentation: { type: 'chart' }, legacy: true },
            legacyDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toThrow('Requires "code" for the visualisation');
      });

      it('can get a legacy dashboardItem', () => {
        expect(
          new DashboardVisualisationExtractor(
            { code: 'viz', data: {}, presentation: { type: 'chart' }, legacy: true },
            legacyDashboardItemValidator,
            yup.object(),
          ).getDashboardItem(),
        ).toEqual({
          code: 'viz',
          config: {
            type: 'chart',
          },
          reportCode: 'viz',
          legacy: true,
        });
      });
    });
  });

  describe('getReport', () => {
    it('can get a report from a viz', () => {
      expect(
        new DashboardVisualisationExtractor(
          {
            code: 'viz',
            name: 'My Viz',
            data: {
              fetch: {
                dataElements: ['BCD1', 'BCD2'],
                organisationUnits: ['$requested', 'TO'],
                startDate: '20210101',
              },
              aggregate: ['SUM_EACH_WEEK'],
              transform: ['keyValueByDataElementName'],
            },
            presentation: {
              type: 'chart',
              chartType: 'bar',
              output: {
                type: 'bar',
                x: 'period',
                y: 'BCD1',
              },
            },
            permissionGroup: 'Admin',
          },
          draftDashboardItemValidator,
          draftReportValidator,
        ).getReport(),
      ).toEqual({
        code: 'viz',
        config: {
          fetch: {
            dataElements: ['BCD1', 'BCD2'],
            organisationUnits: ['$requested', 'TO'],
            startDate: '20210101',
            aggregations: ['SUM_EACH_WEEK'],
          },
          transform: ['keyValueByDataElementName'],
        },
        permissionGroup: 'Admin',
      });
    });

    it('includes output if previewMode is presentation', () => {
      expect(
        new DashboardVisualisationExtractor(
          {
            code: 'viz',
            name: 'My Viz',
            data: {
              fetch: {
                dataElements: ['BCD1', 'BCD2'],
              },
              transform: ['keyValueByDataElementName'],
            },
            presentation: {
              type: 'chart',
              chartType: 'bar',
              output: {
                type: 'bar',
                x: 'period',
                y: 'BCD1',
              },
            },
            permissionGroup: 'Admin',
          },
          draftDashboardItemValidator,
          draftReportValidator,
        ).getReport(PreviewMode.PRESENTATION),
      ).toEqual({
        code: 'viz',
        config: {
          fetch: {
            dataElements: ['BCD1', 'BCD2'],
          },
          transform: ['keyValueByDataElementName'],
          output: {
            type: 'bar',
            x: 'period',
            y: 'BCD1',
          },
        },
        permissionGroup: 'Admin',
      });
    });
  });

  describe('getDashboardItem', () => {
    it('can get a dashboardItem from a viz', () => {
      expect(
        new DashboardVisualisationExtractor(
          {
            code: 'viz',
            name: 'My Viz',
            data: {
              fetch: {
                dataElements: ['BCD1', 'BCD2'],
              },
              transform: ['keyValueByDataElementName'],
            },
            presentation: {
              type: 'chart',
              chartType: 'bar',
              output: {
                type: 'bar',
              },
            },
            permissionGroup: 'Admin',
          },
          draftDashboardItemValidator,
          draftReportValidator,
        ).getDashboardItem(),
      ).toEqual({
        code: 'viz',
        config: {
          name: 'My Viz',
          type: 'chart',
          chartType: 'bar',
        },
        reportCode: 'viz',
        legacy: false,
      });
    });
  });

  describe('getDashboardVisualisationResource', () => {
    it('can get a vizResource from a viz', () => {
      expect(
        new DashboardVisualisationExtractor(
          {
            code: 'viz',
            name: 'My Viz',
            data: {
              fetch: {
                dataElements: ['BCD1', 'BCD2'],
              },
              transform: ['keyValueByDataElementName'],
            },
            presentation: {
              type: 'chart',
              chartType: 'bar',
              output: {
                type: 'bar',
              },
            },
            permissionGroup: 'Admin',
          },
          draftDashboardItemValidator,
          draftReportValidator,
        ).getDashboardVisualisationResource(),
      ).toEqual({
        report: {
          code: 'viz',
          config: {
            fetch: {
              dataElements: ['BCD1', 'BCD2'],
            },
            transform: ['keyValueByDataElementName'],
            output: {
              type: 'bar',
            },
          },
          permission_group: 'Admin',
        },
        dashboardItem: {
          code: 'viz',
          config: {
            name: 'My Viz',
            type: 'chart',
            chartType: 'bar',
          },
          report_code: 'viz',
          legacy: false,
        },
      });
    });
  });
});
