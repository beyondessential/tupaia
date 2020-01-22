/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// other packages currently use getDhisApiInstance directly, but this should be removed at some point
// in future when they do everything via the data-broker
export { getDhisApiInstance } from './services/dhis/getDhisApiInstance';

export { DataBroker } from './DataBroker';
