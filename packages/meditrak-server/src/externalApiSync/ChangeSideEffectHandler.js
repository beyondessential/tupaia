/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { SyncQueueChangesManipulator } from './SyncQueueChangesManipulator';

export class ChangeSideEffectHandler extends SyncQueueChangesManipulator {
  /**
   * @abstract
   */
  triggerSideEffects() {}
}
