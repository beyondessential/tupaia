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
    this.channels.push(channel);
    this.pg.listen(channel, async stringPayload => {
      let payload = stringPayload || '';
      
      // If the payload is valid JSON, then replace it with such
      try {
        payload = JSON.parse(payload);
      } catch {}

      await handler(payload);
    });
  }

  publish(channel, payload) {
    this.pg.query(`NOTIFY ${channel}, '${JSON.stringify(payload)}'`);
  }
}
