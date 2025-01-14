import { sleep } from '@tupaia/utils';

export class DummySyncQueue {
  constructor() {
    this.queue = {};
    this.add = this.add.bind(this);
  }

  async getChange(recordId) {
    await sleep(100); // wait in case the change is still coming in through db notification
    return this.queue[recordId];
  }

  add(change) {
    this.queue[change.record_id] = change;
  }

  clear() {
    this.queue = {};
  }

  count(collectionName, changeType) {
    return Object.values(this.queue).filter(changeRecord => {
      let shouldInclude = true;
      if (collectionName) {
        shouldInclude = shouldInclude && changeRecord.record_type === collectionName;
      }
      if (changeType) {
        shouldInclude = shouldInclude && changeRecord.type === changeType;
      }
      return shouldInclude;
    }).length;
  }
}
