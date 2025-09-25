import {
  DataElementModel as BaseDataElementModel,
  DataElementRecord as BaseDataElementRecord,
} from '@tupaia/database';
import { DataElement } from '@tupaia/types';
import { Model } from './types';

export interface DataElementRecord extends DataElement, BaseDataElementRecord {}

export interface DataElementModel
  extends Model<BaseDataElementModel, DataElement, DataElementRecord> {}
