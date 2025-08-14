import { PERIOD_TYPES, utcMoment } from '@tupaia/tsutils';
import { momentToPeriod } from '@tupaia/utils';

import { Builder } from '../Builder';
import { FetchOptions, Event } from '../../types';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { EventCheckConditionsConfig, DefaultValue, configValidators } from './config';
import {
  validateConfig,
  convertBooleanToNumber,
  replaceDataValuesWithDefaults,
  isValidIndicatorValue,
} from '../helpers';

type BuilderConfig = {
  readonly formula: string;
  readonly programCode: string;
  readonly defaultValues: Record<string, DefaultValue>;
};

const indicatorToBuilderConfig = (indicatorConfig: EventCheckConditionsConfig): BuilderConfig => {
  const { defaultValues = {}, ...otherFields } = indicatorConfig;

  return {
    ...otherFields,
    defaultValues,
  };
};

export class EventCheckConditionsBuilder extends Builder {
  private configCache: BuilderConfig | null = null;

  protected buildAnalyticValues = async (fetchOptions: FetchOptions) => {
    const events = await this.fetchEvents(fetchOptions);
    return this.buildAnalyticValuesFromEvents(events);
  };

  private get config() {
    if (!this.configCache) {
      validateConfig<EventCheckConditionsConfig>(this.indicator.config, configValidators);
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
    });
  };

  private buildAnalyticValuesFromEvents = (events: Event[]) => {
    const { defaultValues, formula } = this.config;
    const parser = getExpressionParserInstance();
    const variables = parser.getVariables(formula);
    const replaceEventValuesWithDefaults = (event: Event) => ({
      ...event,
      dataValues: replaceDataValuesWithDefaults(event.dataValues, defaultValues),
    });
    const checkEventIncludesAllVariables = (event: Event) =>
      variables.every((variable: string) => variable in event.dataValues);

    return events
      .map(replaceEventValuesWithDefaults)
      .filter(checkEventIncludesAllVariables)
      .map(({ orgUnit, eventDate, dataValues }) => ({
        organisationUnit: orgUnit,
        period: momentToPeriod(utcMoment(eventDate), PERIOD_TYPES.DAY),
        value: convertBooleanToNumber(parser, formula, dataValues),
      }))
      .filter(({ value }) => isValidIndicatorValue(value));
  };
}
