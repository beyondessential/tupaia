import { types as pgTypes } from 'pg';
import { TupaiaDatabase } from './TupaiaDatabase';

export class DataTableDatabase extends TupaiaDatabase {
  /** @override */
  async setCustomTypeParsers() {
    await super.setCustomTypeParsers();

    pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, Number.parseFloat);
    pgTypes.setTypeParser(pgTypes.builtins.INT8, Number.parseInt); // bigInt type to Integer
  }
}
