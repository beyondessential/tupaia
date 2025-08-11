import PGPubSub from 'pg-pubsub';
import winston from 'winston';

import { getConnectionConfig } from './getConnectionConfig';

export class TupaiaChangeChannel extends PGPubSub {
  constructor() {
    super(getConnectionConfig(), { log: winston.info });
  }
}
