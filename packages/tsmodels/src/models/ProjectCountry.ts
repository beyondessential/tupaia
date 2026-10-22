import { ProjectCountry } from '@tupaia/types';
import {
  ProjectCountryModel as BaseProjectCountryModel,
  ProjectCountryRecord as BaseProjectCountryRecord,
} from '@tupaia/database';
import { Model } from './types';

export interface ProjectCountryRecord extends ProjectCountry, BaseProjectCountryRecord {}

export interface ProjectCountryModel
  extends Model<BaseProjectCountryModel, ProjectCountry, ProjectCountryRecord> {}
