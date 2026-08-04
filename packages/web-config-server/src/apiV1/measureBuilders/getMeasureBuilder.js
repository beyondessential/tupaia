import * as measureBuilders from './';

const DEFAULT_NAME = 'valueForOrgGroup';

export const getMeasureBuilder = name => measureBuilders[name] || measureBuilders[DEFAULT_NAME];
