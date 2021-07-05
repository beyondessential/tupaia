/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { OutdatedStatusUpdater } from './OutdatedStatusUpdater';

const UPDATE_DEBOUNCE_TIME = 250; // wait 250ms after changes before updating, to avoid double-up

export class SurveyResponseChangeHandler {
  constructor(models, updateDebounceTime = UPDATE_DEBOUNCE_TIME) {
    this.models = models;
    this.updateDebounceTime = updateDebounceTime;
    this.outdatedStatusUpdateCandidates = [];
    this.scheduledUpdateTimeout = null;
    this.scheduledUpdatePromise = null;
    this.scheduledUpdatePromiseResolve = null;
    this.activeUpdatePromise = null;
    this.changeHandlerCancellers = [];

    this.outdatedStatusUpdater = new OutdatedStatusUpdater(this.models);
  }

  listenForChanges() {
    this.changeHandlerCancellers = [
      this.models.surveyResponse.addChangeHandler(this.handleSurveyResponseChange),
    ];
  }

  stopListeningForChanges() {
    this.changeHandlerCancellers.forEach(c => c());
    this.changeHandlerCancellers = [];
  }

  handleSurveyResponseChange = async changeDetails => {
    const newCandidates = OutdatedStatusUpdater.getCandidatesFromChangeDetails(changeDetails);
    this.outdatedStatusUpdateCandidates.push(...newCandidates);
    return this.scheduleOutdatedStatusUpdate();
  };

  async scheduleOutdatedStatusUpdate() {
    // wait for any active update to finish before scheduling a new one
    await this.activeUpdatePromise;

    // clear any previous scheduled rebuild, so that we debounce all changes in the same time period
    if (this.scheduledUpdateTimeout) {
      clearTimeout(this.scheduledUpdateTimeout);
    }

    if (!this.scheduledUpdatePromise) {
      this.scheduledUpdatePromise = new Promise(resolve => {
        this.scheduledUpdatePromiseResolve = resolve;
      });
    }

    this.scheduledUpdateTimeout = setTimeout(() => {
      this.activeUpdatePromise = this.updateOutdatedStatus();
    }, this.updateDebounceTime);

    return this.scheduledUpdatePromise;
  }

  updateOutdatedStatus = async () => {
    // remove timeout so any jobs added now get scheduled anew
    const existingResolve = this.scheduledUpdatePromiseResolve;
    this.scheduledUpdateTimeout = null;
    this.scheduledUpdatePromise = null;

    await this.outdatedStatusUpdater.processChangedResponses(this.outdatedStatusUpdateCandidates);
    this.outdatedStatusUpdateCandidates = [];

    existingResolve();
  };
}
