
import { ChangeHandler } from './ChangeHandler';

export class AnalyticsRefresher extends ChangeHandler {
  debounceTime = 1000;

  constructor(models) {
    super(models, 'analytics-refresher');

    this.changeTranslators = {
      answer: () => [],
      surveyResponse: () => [],
      survey: () => [],
      entity: () => [],
      question: () => [],
      dataElement: () => [],
    };
  }

  static refreshAnalytics = async database => {
    await database.executeSql(`SELECT mv$refreshMaterializedView('analytics', 'public', true);`);
  };

  handleChanges(transactingModels) {
    return AnalyticsRefresher.refreshAnalytics(transactingModels.database);
  }
}
