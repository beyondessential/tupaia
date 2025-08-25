import {
  ExternalDatabaseConnectionModel as BaseExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord as BaseExternalDatabaseConnectionRecord,
} from '@tupaia/database';
import { ExternalDatabaseConnection } from '@tupaia/types';
import { Model } from './types';

export interface ExternalDatabaseConnectionRecord
  extends ExternalDatabaseConnection,
    BaseExternalDatabaseConnectionRecord {}

export interface ExternalDatabaseConnectionModel
  extends Model<
    BaseExternalDatabaseConnectionModel,
    ExternalDatabaseConnection,
    ExternalDatabaseConnectionRecord
  > {}
