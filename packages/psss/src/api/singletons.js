/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TupaiaApi } from './TupaiaApi';
import { FakeAPI as TempApi } from './FakeApi';

export const API = new TupaiaApi();
export const FakeAPI = new TempApi();
