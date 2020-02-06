/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import xlsx from 'xlsx';
import sinon from 'sinon';

import { WorkBookParser } from '../WorkBookParser';

chai.use(chaiAsPromised);

const SHEETS = {
  Sheet1: [
    { HeaderA: 'Value1', HeaderB: 'Value2' },
    { HeaderA: 'Value3', HeaderB: 'Value4' },
  ],
  Sheet2: [
    { HeaderC: 'Value5', HeaderD: 'Value6' },
    { HeaderC: 'Value7', HeaderD: 'Value8' },
  ],
};
const WORK_BOOK = {
  Sheets: SHEETS,
};

describe('WorkBookParser', () => {
  before(() => {
    sinon.stub(xlsx.utils, 'sheet_to_json').callsFake(sheet => sheet);
  });

  describe('parse()', () => {
    it('should use the provided mappers to parse a workbook', async () => {
      const mappers = {
        Sheet1: row => {
          const flipHeaderAndValue = (result, [header, value]) => {
            return { ...result, [value]: header };
          };
          return Object.entries(row).reduce(flipHeaderAndValue, {});
        },
      };
      const parser = new WorkBookParser(mappers);

      return expect(parser.parse(WORK_BOOK)).to.eventually.deep.equal({
        Sheet1: [
          { Value1: 'HeaderA', Value2: 'HeaderB' },
          { Value3: 'HeaderA', Value4: 'HeaderB' },
        ],
        Sheet2: [
          { HeaderC: 'Value5', HeaderD: 'Value6' },
          { HeaderC: 'Value7', HeaderD: 'Value8' },
        ],
      });
    });

    it('should map the input to itself if no mapper is provided', () => {
      const parser = new WorkBookParser();
      return expect(parser.parse(WORK_BOOK)).to.eventually.deep.equal(SHEETS);
    });

    describe('should use the provided validators to validate a spreadsheet', () => {
      const errorMessage = 'Invalid value for Header C';
      const constructValidators = invalidHeaderCValue => ({
        Sheet2: row => {
          if (row.HeaderC === invalidHeaderCValue) {
            throw new Error(errorMessage);
          }
        },
      });

      it('validator is triggered correctly', () => {
        const triggeringValue = 'Value7';
        const validators = constructValidators(triggeringValue);
        const parser = new WorkBookParser({}, validators);

        return expect(parser.parse(WORK_BOOK)).to.be.rejectedWith(errorMessage);
      });

      it("validator is not triggered when it shouldn't", () => {
        const nonTriggeringValue = 'Value6';
        const validators = constructValidators(nonTriggeringValue);
        const parser = new WorkBookParser({}, validators);

        return expect(parser.parse(WORK_BOOK)).to.eventually.deep.equal(SHEETS);
      });
    });
  });

  describe('setSheetNameFilter()', () => {
    it('should use the provided sheet name filter to filter out specific tabs', async () => {
      const parser = new WorkBookParser();
      parser.setSheetNameFilter(['Sheet1']);

      const parsedWorkBook = await parser.parse(WORK_BOOK);
      expect(parsedWorkBook).to.have.property('Sheet1');
      expect(parsedWorkBook).to.not.have.property('Sheet2');
    });
  });

  after(() => {
    xlsx.utils.sheet_to_json.restore();
  });
});
