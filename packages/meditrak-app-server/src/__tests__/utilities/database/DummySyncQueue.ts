type ChangeRecord = { record_id: string; record_type: string; type: string };

export class DummySyncQueue {
  private queue: Record<string, ChangeRecord> = {};

  public add(change: ChangeRecord) {
    this.queue[change.record_id] = change;
  }

  public clear() {
    this.queue = {};
  }

  public count(collectionName: string, changeType?: string) {
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
