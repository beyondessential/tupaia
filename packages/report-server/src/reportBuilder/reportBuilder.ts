import type { Report } from '@tupaia/types';
import { configValidator } from './configValidator';
import { buildContext, ReqContext } from './context';
import { buildTransform, TransformTable } from './transform';
import { buildOutput } from './output';
import { Row } from './types';
import { OutputType } from './output/functions/outputBuilders';
import { CustomReportOutputType, customReports } from './customReports';

export interface BuiltReport {
  results: OutputType | CustomReportOutputType;
  type?: string;
}

export class ReportBuilder {
  private readonly reqContext: ReqContext;
  private config?: Report['config'];
  private testData?: Row[];

  public constructor(reqContext: ReqContext) {
    this.reqContext = reqContext;
  }

  public setConfig = (config: Record<string, unknown>) => {
    this.config = configValidator.validateSync(config);
    return this;
  };

  public setTestData = (testData: Row[]) => {
    this.testData = testData;
    return this;
  };

  public build = async (): Promise<BuiltReport> => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }

    if ('customReport' in this.config) {
      const customReportBuilder = customReports[this.config.customReport];
      if (!customReportBuilder) {
        throw new Error(`Custom report ${this.config.customReport} does not exist`);
      }

      const customReportData = await customReportBuilder(this.reqContext);
      return { results: customReportData };
    }

    const data = this.testData || [];
    const context = await buildContext(this.config.transform, this.reqContext);
    const transform = buildTransform(this.config.transform, context);
    const transformedData = await transform(TransformTable.fromRows(data));
    const output = buildOutput(this.config.output, this.reqContext.aggregator);
    const outputData = await output(transformedData);

    const outputTypeString = this.config.output?.type || 'default';

    return { results: outputData, type: outputTypeString };
  };
}
