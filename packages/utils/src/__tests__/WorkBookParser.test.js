/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import sinon from 'sinon';

import { WorkBookParser } from '../WorkBookParser';

// chai.use(chaiAsPromised);

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
  beforeAll(() => {
    xlsx.utils.sheet_to_json = jest.fn().mockImplementation(sheet => sheet);
  });

  afterAll(() => {
    xlsx.utils.sheet_to_json.mockReset();
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
      expect.assertions(1);
      const result = await parser.parse(WORK_BOOK);
      expect(result).toEqual({
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

    it('should map the input to itself if no mapper is provided', async () => {
      const parser = new WorkBookParser();
      const result = await parser.parse(WORK_BOOK);
      return expect(result).toEqual(SHEETS);
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

      it('validator is triggered correctly', async () => {
        const triggeringValue = 'Value7';
        const validators = constructValidators(triggeringValue);
        const parser = new WorkBookParser({}, validators);
        await expect(parser.parse(WORK_BOOK)).rejects.toThrow(errorMessage);
      });

      it("validator is not triggered when it shouldn't", async () => {
        const nonTriggeringValue = 'Value6';
        const validators = constructValidators(nonTriggeringValue);
        const parser = new WorkBookParser({}, validators);
        const result = await parser.parse(WORK_BOOK);
        return expect(result).toEqual(SHEETS);
      });
    });
  });

  describe('setSheetNameFilter()', () => {
    it('should use the provided sheet name filter to filter out specific tabs', async () => {
      const parser = new WorkBookParser();
      parser.setSheetNameFilter(['Sheet1']);

      const parsedWorkBook = await parser.parse(WORK_BOOK);
      expect(parsedWorkBook).toHaveProperty('Sheet1');
      expect(parsedWorkBook).not.toHaveProperty('Sheet2');
    });
  });
});
