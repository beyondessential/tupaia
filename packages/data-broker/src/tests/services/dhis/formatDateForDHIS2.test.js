import { expect } from 'chai';
import {
  formatDateForDHIS2,
  formatDateTimeForDHIS2,
} from '../../../services/dhis/formatDateForDHIS2';

describe('formatDateForDHIS2()', () => {
  it('should format the date without converting it to a different timezone', () => {
    expect(formatDateForDHIS2('2018-10-18')).to.equal('2018-10-18');
    expect(formatDateForDHIS2('2018-10-18T06:10:20-10:00')).to.equal('2018-10-18');
    expect(formatDateForDHIS2('2018-10-18T06:10:20+00:00')).to.equal('2018-10-18');
    expect(formatDateForDHIS2('2018-10-18T06:10:20+10:00')).to.equal('2018-10-18');
  });
});

describe('formatDateTimeForDHIS2()', () => {
  it('should format the date without converting it to a different timezone', () => {
    expect(formatDateTimeForDHIS2('2018-10-18')).to.equal('2018-10-18T00:00:00');
    expect(formatDateTimeForDHIS2('2018-10-18T06:10:20-10:00')).to.equal('2018-10-18T06:10:20');
    expect(formatDateTimeForDHIS2('2018-10-18T06:10:20+00:00')).to.equal('2018-10-18T06:10:20');
    expect(formatDateTimeForDHIS2('2018-10-18T06:10:20+10:00')).to.equal('2018-10-18T06:10:20');
  });
});
