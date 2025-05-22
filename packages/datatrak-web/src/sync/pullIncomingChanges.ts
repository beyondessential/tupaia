import { saveIncomingChanges } from '@tupaia/sync';
import { ModelRegistry } from '@tupaia/database';

import { CentralServerConnection } from './CentralServerConnection';

// TODO: Get from logged in user
const PROJECT_IDS = ['5dfc6eaf61f76a497716cddf'];

export const pullIncomingChanges = async (
  centralServer: CentralServerConnection,
  models: ModelRegistry,
  sessionId: string,
  since: number,
) => {
  console.log('ClientSyncManager.pull.waitingForCentral');
  await centralServer.initiatePull(sessionId, since, PROJECT_IDS);

  const reader = await centralServer.pull(sessionId);
  const decoder = new TextDecoder();
  let totalPulled = 0;

  try {
    await models.wrapInTransaction(async models => {
      while (true) {
        const { done, value } = await reader.read();
        const batch = decoder.decode(value, { stream: true });
        const lines = batch.split('\n').filter(line => line.trim());

        const objects: any[] = [];

        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            objects.push(obj);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
        }

        console.log('objects', objects);

        totalPulled += objects.length;

        await saveIncomingChanges(models, objects, false);

        if (done) {
          break;
        }
      }
    });
  } finally {
    // TODO: Remove test code
    console.log(
      'Option set records in database ',
      await models.getModelForDatabaseRecord('option_set').find({}),
    );
  }
  
  return { totalPulled };
};
