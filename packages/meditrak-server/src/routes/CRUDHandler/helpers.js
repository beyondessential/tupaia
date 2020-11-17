/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// if the endpoint is /survey/5a5d1c66ae07fb3fb025c3a3/answer, the resource is 'survey'
export const extractResourceFromEndpoint = endpoint => endpoint.split('/')[1];

// if the endpoint is /survey/5a5d1c66ae07fb3fb025c3a3/answer, the child resource is 'answer'
export const extractChildResourceFromEndpoint = endpoint => endpoint.split('/')[3];
