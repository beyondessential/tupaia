import { SyncQueueChangesManipulator } from './SyncQueueChangesManipulator';

export class ChangeSideEffectHandler extends SyncQueueChangesManipulator {
  /**
   * @abstract
   */
  triggerSideEffects() {}
}
