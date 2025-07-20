import { PGlite } from '@electric-sql/pglite';
import { getPGliteInstance } from './getPGliteInstance';

export class BrowserChangeChannel {
  pg: PGlite;

  constructor() {
    this.pg = getPGliteInstance();
    console.log('this.pg', this.pg);
  }

  async close() {
    return this.pg.close();
  }

  addChannel(channel, handler) {
    this.pg.listen(channel, handler);
  }

  publish(channel, payload) {
    this.pg.query(`NOTIFY ${channel}, '${JSON.stringify(payload)}'`);
  }
}
