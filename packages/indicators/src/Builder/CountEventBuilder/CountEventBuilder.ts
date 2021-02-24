/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { utcMoment, PERIOD_TYPES, momentToPeriod } from '@tupaia/utils';

import { Builder } from '../Builder';
import { FetchOptions, Event, DataValues } from '../../types';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { CountEventConfig, DefaultValue, configValidators } from './config';
import { validateConfig, evaluateFormulaToNumber } from '../helpers';

type BuilderConfig = {
  readonly formula: string;
  readonly programCode: string;
  readonly defaultValues: Record<string, DefaultValue>;
};

const indicatorToBuilderConfig = (indicatorConfig: CountEventConfig): BuilderConfig => {
  const { defaultValues = {}, ...otherFields } = indicatorConfig;

  return {
    ...otherFields,
    defaultValues,
  };
};

export class CountEventBuilder extends Builder {
  private configCache: BuilderConfig | null = null;

  buildAnalyticValues = async (fetchOptions: FetchOptions) => {
    const events = await this.fetchEvents(fetchOptions);
    return this.buildAnalyticValuesFromEvents(events);
  };

  private get config() {
    if (!this.configCache) {
      validateConfig<CountEventConfig>(this.indicator.config, configValidators);
      this.configCache = indicatorToBuilderConfig(this.indicator.config);
    }
    return this.configCache;
  }

  private fetchEvents = async (fetchOptions: FetchOptions) => {
    const parser = getExpressionParserInstance();
    const dataElementCodes = parser.getVariables(this.config.formula);
    const aggregator = this.api.getAggregator();
    return aggregator.fetchEvents(this.config.programCode, {
      ...fetchOptions,
      dataElementCodes,
      useDeprecatedApi: false,
    });
  };

  private buildAnalyticValuesFromEvents = (events: Event[]) => {
    const { defaultValues, formula } = this.config;
    const parser = getExpressionParserInstance();
    const calculateValue = (eventDataValues: DataValues) => {
      const dataValues = { ...eventDataValues };
      Object.keys(defaultValues).forEach(code => {
        dataValues[code] = dataValues[code] ?? defaultValues[code];
      });
      return evaluateFormulaToNumber(parser, formula, dataValues)
    };

    return events
      .map(({ orgUnit, eventDate, dataValues }) => ({
        organisationUnit: orgUnit,
        period: momentToPeriod(utcMoment(eventDate), PERIOD_TYPES.DAY),
        value: calculateValue(dataValues),
      }))
      .filter(({ value }) => isFinite(value));
  };
}
