import { expect } from 'chai';
import { getStandardisedImageName } from '../../utilities/getStandardisedImageName';

describe('getStandardisedImageName()', () => {
  it('should return the correct image name', () => {
    expect(getStandardisedImageName('test', 'logo')).to.equal('test_logo');
  });
});
