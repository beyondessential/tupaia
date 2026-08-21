import chai from 'chai';
import { getStandardisedImageName } from '../../utilities/getStandardisedImageName';

const { expect } = chai;

describe('getStandardisedImageName()', () => {
  it('should return the correct image name', () => {
    expect(getStandardisedImageName('test', 'logo')).to.equal('test_logo');
  });
});
