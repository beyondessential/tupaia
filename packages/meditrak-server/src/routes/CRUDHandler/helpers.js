/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// if the endpoint is /surveys/5a5d1c66ae07fb3fb025c3a3/answers, the resource is 'surveys'
export const extractResourceFromEndpoint = endpoint => endpoint.split('/')[1];

// if the endpoint is /surveys/5a5d1c66ae07fb3fb025c3a3/answers, the child resource is 'answers'
export const extractChildResourceFromEndpoint = endpoint => endpoint.split('/')[3];
