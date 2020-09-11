/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

let modelsSingleton;
export const setSingletonModelRegistry = models => {
  modelsSingleton = models;
};

export const getModelRegistry = () => modelsSingleton;
