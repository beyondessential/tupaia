import { isDimension } from '../dimensions';

describe('dimensions', () => {
  describe('isDimension()', () => {
    it('should return true for valid DHIS2 dimensions', () => {
      const testData = ['dx', 'ou', 'pe'];
      testData.forEach(key => {
        expect(isDimension(key)).toBeTrue();
      });
    });

    it('should return false for invalid DHIS2 dimensions', () => {
      const testData = ['random', 'OU'];
      testData.forEach(key => {
        expect(isDimension(key)).toBeFalse();
      });
    });
  });
});
