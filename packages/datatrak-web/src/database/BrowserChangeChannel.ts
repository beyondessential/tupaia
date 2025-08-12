import { PGlite } from '@electric-sql/pglite';
import { getPGliteInstance } from './getPGliteInstance';

export class BrowserChangeChannel {
  pg: PGlite;

  channels: string[];

  constructor() {
    this.pg = getPGliteInstance();
    this.channels = [];
  }

  async close() {
    await Promise.all(this.channels.map(channel => this.pg.unlisten(channel)));
  }

  addChannel(channel, handler) {
    this.pg.listen(channel, handler);
  }

  publish(channel, payload) {
    this.pg.query(`NOTIFY ${channel}, '${JSON.stringify(payload)}'`);
  }
}
