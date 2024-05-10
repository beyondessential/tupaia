/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  CountryModel as BaseCountryModel,
  CountryRecord as BaseCountryRecord,
} from '@tupaia/database';
import { Country } from '@tupaia/types';
import { Model } from './types';

export interface CountryRecord extends Country, BaseCountryRecord {}

export interface CountryModel extends Model<BaseCountryModel, Country, CountryRecord> {}
