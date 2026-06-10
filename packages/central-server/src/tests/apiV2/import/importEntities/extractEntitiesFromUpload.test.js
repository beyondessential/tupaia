import { expect } from 'chai';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import xlsx from 'xlsx';

import { extractEntitiesFromUpload } from '../../../../apiV2/import/importEntities/extractEntitiesFromUpload';

const writeXlsx = rows => {
  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Entities');
  const filePath = path.join(os.tmpdir(), `extract-entities-test-${Date.now()}-${Math.random()}.xlsx`);
  xlsx.writeFile(workbook, filePath);
  return filePath;
};

describe('extractEntitiesFromUpload', () => {
  it('parses a JSON attributes cell into an object (round-trips the exporter format)', () => {
    // The exporter writes attributes with JSON.stringify; the importer must
    // JSON.parse them. Previously it used convertCellToJson (key:value lines),
    // which mangled {"andrewtest":"true"} into {'{"andrewtest"':'"true"}'}.
    const filePath = writeXlsx([
      { code: 'TEST_X', attributes: JSON.stringify({ andrewtest: 'true', count: '5' }) },
    ]);
    try {
      const [entity] = extractEntitiesFromUpload(filePath);
      expect(entity.attributes).to.deep.equal({ andrewtest: 'true', count: '5' });
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  it('also parses a JSON data_service_entity cell', () => {
    const filePath = writeXlsx([
      { code: 'TEST_X', data_service_entity: JSON.stringify({ dhisId: 'abc' }) },
    ]);
    try {
      const [entity] = extractEntitiesFromUpload(filePath);
      expect(entity.data_service_entity).to.deep.equal({ dhisId: 'abc' });
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  it('throws a clear error on a non-JSON attributes cell', () => {
    const filePath = writeXlsx([{ code: 'TEST_X', attributes: 'andrewtest:true' }]);
    let caught;
    try {
      extractEntitiesFromUpload(filePath);
    } catch (error) {
      caught = error;
    } finally {
      fs.unlinkSync(filePath);
    }
    expect(caught?.message).to.match(/Invalid JSON in the "attributes" column/);
  });

  it('leaves a blank attributes cell untouched', () => {
    const filePath = writeXlsx([{ code: 'TEST_X', name: 'No attrs' }]);
    try {
      const [entity] = extractEntitiesFromUpload(filePath);
      expect(entity.attributes).to.be.undefined;
    } finally {
      fs.unlinkSync(filePath);
    }
  });
});
