import { PGlite } from '@electric-sql/pglite';
import { getPGliteInstance } from './getPGliteInstance';

export class BrowserChangeChannel {
  constructor() {
    this.pg = getPGliteInstance();
  }

  async close() {
    this.pg.close();
  }

  addChannel(channel, handler) {
    this.pg.listen(channel, handler);
  }

  publish(channel, payload) {
    this.pg.query(`NOTIFY ${channel}, '${JSON.stringify(payload)}'`);
  }
}
