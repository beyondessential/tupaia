import {
  CountryModel as BaseCountryModel,
  CountryRecord as BaseCountryRecord,
} from '@tupaia/database';
import { Country } from '../models';
import { Model } from './types';

export interface CountryRecord extends Country, BaseCountryRecord {}

export interface CountryModel extends Model<BaseCountryModel, Country, CountryRecord> {}
