/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Data pulls sometimes return tracked entity instance ids. This translator
 * converts these ids to entity codes.
 */
export class TrackedEntityInstanceTranslator {
  constructor(models) {
    this.models = models;
  }

  /**
   * @param {Event[]} events - array of Tupaia type Events
   * @return {Event[]}
   */
  translate(events) {}
}
