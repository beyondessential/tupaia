import type { KoBoApi } from '@tupaia/kobo-api';
import { DataBrokerModelRegistry, Event, SyncGroupResults } from '../../types';
import { DataServiceMapping } from '../DataServiceMapping';
import { Service } from '../Service';
import { KoBoTranslator } from './KoBoTranslator';
import { KoboSubmission, DataServiceSyncGroup } from './types';

type PullSyncGroupResultsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  startSubmissionTime?: string;
};

export class KoBoService extends Service {
  private readonly api: KoBoApi;
  private readonly translator: KoBoTranslator;

  public constructor(models: DataBrokerModelRegistry, api: KoBoApi) {
    super(models);

    this.api = api;
    this.translator = new KoBoTranslator(this.models);
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in KoBoService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in KoBoService');
  }

  public async pullAnalytics(): Promise<never> {
    throw new Error('pullAnalytics is not supported in KoBoService');
  }

  public async pullEvents(): Promise<never> {
    throw new Error('pullEvents is not supported in KoBoService');
  }

  public pullSyncGroupResults = async (
    syncGroups: DataServiceSyncGroup[],
    options: PullSyncGroupResultsOptions,
  ): Promise<SyncGroupResults> => {
    const resultsByDataGroupCode: Record<string, Event[]> = {};

    for (const source of syncGroups) {
      const { koboSurveyCode, questionMapping, entityQuestionCode } = source.config;
      if (!koboSurveyCode) {
        throw new Error(`Missing 'koboSurveyCode' in sync group config`);
      }

      if (!entityQuestionCode) {
        throw new Error(`Missing 'entityQuestionCode' in sync group config`);
      }

      if (!questionMapping) {
        throw new Error(`Missing 'questionMapping' in sync group config`);
      }

      const results: KoboSubmission[] = await this.api.fetchKoBoSubmissions(
        koboSurveyCode,
        options,
      );

      resultsByDataGroupCode[source.data_group_code] = await this.translator.translateKoBoResults(
        results,
        questionMapping,
        entityQuestionCode,
      );
    }

    return resultsByDataGroupCode;
  };
}
