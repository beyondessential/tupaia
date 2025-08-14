import {
  BasicAuthHandler,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
  getDefaultBaseUrls,
} from '@tupaia/api-client';
import { Script, requireEnv } from '@tupaia/utils';
import { compare } from './compare';
import { writeLogFile } from './writeLogFile';
import { messageSlack } from './messageSlack';
import { healthCheck } from './healthCheck';

const LOCAL_INSTANCE = 'localhost';

export class VizTestToolScript extends Script {
  config = {
    scriptName: 'yarn workspace @tupaia/viz-test-tool',
    command: [
      {
        command: 'health-check [<instance>]',
        describe:
          'Perform a check on the <instance> (defaults to local) to see which vizes are successfully returning data',
      },
      {
        command: 'compare <compare-instance> [<baseline-instance>]',
        describe:
          'Run a comparison test between the <baselineInstance> (defaults to local) and the given <compareInstance> to see if the data matches between the two',
      },
    ],
    options: {
      notify: {
        alias: 'n',
        type: 'boolean',
        description: 'Sends the test results to the viz-test-tool slack channel',
      },
    },
  };

  private logCompleteMessage(logFilePath: string) {
    this.logInfo(`Complete!\nSee logs at: ${logFilePath}`);
  }

  private getAuthHandler() {
    const username = requireEnv('VIZ_TEST_TOOL_USER');
    const password = requireEnv('VIZ_TEST_TOOL_PASSWORD');
    return new BasicAuthHandler(username, password);
  }

  private async runCompare() {
    const authHandler = this.getAuthHandler();
    const { compareInstance, baselineInstance = LOCAL_INSTANCE, notify } = this.args;
    if (!compareInstance) {
      throw new Error(`Must specify <compare-instance> to compare with`);
    }

    const baselineUrls =
      baselineInstance === LOCAL_INSTANCE
        ? LOCALHOST_BASE_URLS
        : getDefaultBaseUrls(`${baselineInstance}-report-api.tupaia.org`);

    const compareUrls = getDefaultBaseUrls(`${compareInstance}-report-api.tupaia.org`);
    const baselineClient = new TupaiaApiClient(authHandler, baselineUrls);
    const compareClient = new TupaiaApiClient(authHandler, compareUrls);

    const result = await compare(baselineInstance, compareInstance, baselineClient, compareClient);
    const logFilePath = writeLogFile(result);

    if (notify) {
      await messageSlack(
        `Compare (${baselineInstance} | ${compareInstance}) result:`,
        result,
        logFilePath,
      );
    }

    this.logCompleteMessage(logFilePath);
  }

  private async runHeathCheck() {
    const { instance, notify } = this.args;

    const authHandler = this.getAuthHandler();
    const baseUrls = instance
      ? getDefaultBaseUrls(`${instance}-report-api.tupaia.org`)
      : LOCALHOST_BASE_URLS;

    const apiClient = new TupaiaApiClient(authHandler, baseUrls);

    const result = await healthCheck(apiClient);
    const logFilePath = writeLogFile(result);

    if (notify) {
      await messageSlack(`Health check result:`, result, logFilePath);
    }

    this.logCompleteMessage(logFilePath);
  }

  public runCommands() {
    const {
      _: [command],
    } = this.args;
    switch (command) {
      case 'compare':
        this.runCompare().catch(error => this.logError(error.message));
        break;
      case 'health-check':
        this.runHeathCheck().catch(error => this.logError(error.message));
        break;
      default:
        throw new Error(`Unknown command ${command}, see usage`);
    }
  }
}
