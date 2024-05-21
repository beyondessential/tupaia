/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

/**
 * This is the index file for all web server requests. This folder is for request types that are common between multiple web servers, e.g. datatrak-web and tupaia-web.
 */
export * as WebServerEntityRequest from './EntityRequest';
export * as WebServerProjectRequest from './ProjectRequest';
export { ProjectResponse } from './ProjectRequest';
