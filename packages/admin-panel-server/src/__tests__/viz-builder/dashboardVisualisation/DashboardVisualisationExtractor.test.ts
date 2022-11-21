/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { yup } from '@tupaia/utils';

import {
  draftDashboardItemValidator,
  legacyDashboardItemValidator,
} from '../../../viz-builder/dashboardVisualisation/validators';
import { PreviewMode } from '../../../viz-builder/types';
import { DashboardVisualisationExtractor } from '../../../viz-builder/dashboardVisualisation/DashboardVisualisationExtractor';
import { draftReportValidator, legacyReportValidator } from '../../../viz-builder';

describe('DashboardVisualisationExtractor', () => {
  describe('validation', () => {
    describe('constructor', () => {
      it('throws error if viz does not have data field', () => {
        const constructor = () =>
          new DashboardVisualisationExtractor({ presentation: {} }, yup.object(), yup.object());

        expect(constructor).toThrow('data is a required field');
      });

      it('throws error if viz does not have presentation field', () => {
        const constructor = () =>
          new DashboardVisualisationExtractor({ data: {} }, yup.object(), yup.object());

        expect(constructor).toThrow('presentation is a required field');
      });
    });

    describe('getReport() - draftReport', () => {
      it('throws error if viz does not have data.fetch', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: { transform: [] }, presentation: {} },
          yup.object(),
          draftReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('fetch is a required field');
      });

      it('throws error if viz does not have data.fetch.dataElements or data.fetch.dataGroups', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: { fetch: {}, transform: [] }, presentation: {} },
          yup.object(),
          draftReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('Requires "dataGroups" or "dataElements"');
      });

      it('throws error if viz does not have data.transform', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: { fetch: { dataElements: ['BCD1'] } }, presentation: {} },
          yup.object(),
          draftReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('transform is a required field');
      });

      it('throws error if viz does not have code', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            data: { fetch: { dataElements: ['BCD1'] }, transform: [] },
            presentation: {},
          },
          yup.object(),
          draftReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('Requires "code" for the visualisation');
      });

      it('can get a draft report', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            code: 'viz',
            data: { fetch: { dataElements: ['BCD1'] }, transform: [] },
            presentation: {},
          },
          yup.object(),
          draftReportValidator,
        );

        const report = extractor.getReport();

        expect(report).toEqual({
          code: 'viz',
          config: {
            fetch: {
              dataElements: ['BCD1'],
            },
            transform: [],
          },
        });
      });

      it('can get a draft report which uses a custom report', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            code: 'viz',
            data: { customReport: 'custom' },
            presentation: {},
          },
          yup.object(),
          draftReportValidator,
        );

        const report = extractor.getReport();

        expect(report).toEqual({
          code: 'viz',
          config: {
            customReport: 'custom',
          },
        });
      });
    });

    describe('getReport() - legacyReport', () => {
      it('throws error if viz does not have data.config', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: { dataBuilder: 'sumPerOrgUnit' }, presentation: {}, legacy: true },
          yup.object(),
          legacyReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('config is a required field');
      });

      it('throws error if viz does not have data.dataBuilder', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            code: 'viz',
            data: { config: {} },
            presentation: {},
            legacy: true,
          },
          yup.object(),
          legacyReportValidator,
        );

        const getReport = () => extractor.getReport();

        expect(getReport).toThrow('dataBuilder is a required field');
      });

      it('can get a legacy report', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            code: 'viz',
            data: { config: {}, dataBuilder: 'sumPerOrgGroup' },
            presentation: {},
            legacy: true,
          },
          yup.object(),
          legacyReportValidator,
        );

        const report = extractor.getReport();

        expect(report).toEqual({
          code: 'viz',
          dataBuilder: 'sumPerOrgGroup',
          config: {},
        });
      });
    });

    describe('getDashboardItem() - draftDashboardItem', () => {
      it('throws error if viz does not have presentation.type', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: {}, presentation: {} },
          draftDashboardItemValidator,
          yup.object(),
        );

        const getDashboardItem = () => extractor.getDashboardItem();

        expect(getDashboardItem).toThrow('Requires "type" in chart config');
      });

      it('throws error if viz does not have code', () => {
        const extractor = new DashboardVisualisationExtractor(
          { data: {}, presentation: { type: 'chart' } },
          draftDashboardItemValidator,
          yup.object(),
        );

        const getDashboardItem = () => extractor.getDashboardItem();

        expect(getDashboardItem).toThrow('Requires "code" for the visualisation');
      });

      it('can get a draft dashboardItem', () => {
        const extractor = new DashboardVisualisationExtractor(
          {
            code: 'viz',
            data: {},
            presentation: { type: 'chart' },
          },
          draftDashboardItemValidator,
          yup.object(),
        );

        const dashboardItem = extractor.getDashboardItem();

        expect(dashboardItem).toEqual({
          code: 'viz',
          config: {
            type: 'chart',
          },
          reportCode: 'viz',
          legacy: false,
        });
      });
    });

    describe('getDashboardItem() - legacyDashboardItem', () => {
      it('throws error if type is not legacy', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: {}, presentation: { type: 'chart' } },
          legacyDashboardItemValidator,
          yup.object(),
        );

        const getDashboardItem = () => extractor.getDashboardItem();

        expect(getDashboardItem).toThrow('legacy must be one of the following values: true');
      });

      it('throws error if viz does not have presentation.type', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: {}, presentation: {}, legacy: true },
          legacyDashboardItemValidator,
          yup.object(),
        );

        const getDashboardItem = () => extractor.getDashboardItem();

        expect(getDashboardItem).toThrow('Requires "type" in chart config');
      });

      it('throws error if viz does not have code', () => {
        const extractor = new DashboardVisualisationExtractor(
          { data: {}, presentation: { type: 'chart' }, legacy: true },
          legacyDashboardItemValidator,
          yup.object(),
        );

        const getDashboardItem = () => extractor.getDashboardItem();

        expect(getDashboardItem).toThrow('Requires "code" for the visualisation');
      });

      it('can get a legacy dashboardItem', () => {
        const extractor = new DashboardVisualisationExtractor(
          { code: 'viz', data: {}, presentation: { type: 'chart' }, legacy: true },
          legacyDashboardItemValidator,
          yup.object(),
        );

        const dashboardItem = extractor.getDashboardItem();

        expect(dashboardItem).toEqual({
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

  describe('getReport()', () => {
    it('can get a report from a viz', () => {
      const extractor = new DashboardVisualisationExtractor(
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
      );

      const report = extractor.getReport();

      expect(report).toEqual({
        code: 'viz',
        config: {
          fetch: {
            dataElements: ['BCD1', 'BCD2'],
            organisationUnits: ['$requested', 'TO'],
            startDate: '20210101',
            aggregations: ['SUM_EACH_WEEK'],
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

    it('includes output if previewMode is presentation', () => {
      const extractor = new DashboardVisualisationExtractor(
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
      );

      const report = extractor.getReport(PreviewMode.PRESENTATION);

      expect(report).toEqual({
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

    it('includes rowsAndColumns output if previewMode is data', () => {
      const extractor = new DashboardVisualisationExtractor(
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
      );

      const report = extractor.getReport(PreviewMode.DATA);

      expect(report).toEqual({
        code: 'viz',
        config: {
          fetch: {
            dataElements: ['BCD1', 'BCD2'],
          },
          transform: ['keyValueByDataElementName'],
          output: {
            type: 'rowsAndColumns',
          },
        },
        permissionGroup: 'Admin',
      });
    });
  });

  describe('getDashboardItem()', () => {
    it('can get a dashboardItem from a viz', () => {
      const extractor = new DashboardVisualisationExtractor(
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
      );

      const dashboardItem = extractor.getDashboardItem();

      expect(dashboardItem).toEqual({
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

  describe('getDashboardVisualisationResource()', () => {
    it('can get a vizResource from a viz', () => {
      const extractor = new DashboardVisualisationExtractor(
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
      );

      const dashboardVisualisationResource = extractor.getDashboardVisualisationResource();

      expect(dashboardVisualisationResource).toEqual({
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
