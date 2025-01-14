/**
 * Increment Date.now() with a change index in order to prevent clashes when inserting multiple records within 1ms of each other
 */
export const getSyncQueueChangeTime = (changeIndex: number) => Date.now() + changeIndex / 1000;
