import { calculateOuterBounds } from '../geoJson';

const listOfBounds = [
  '{"type":"Polygon","coordinates":[[[-174.743355,-11.646],[-174.743355,4.9],[177.0479136,4.9],[177.0479136,-11.646],[-174.743355,-11.646]]]}',
  '{"type":"Polygon","coordinates":[[[-179.395198,-24.1625706],[-179.395198,-15.3655722],[-173.5295458,-15.3655722],[-173.5295458,-24.1625706],[-179.395198,-24.1625706]]]}',
];

describe('calculateOuterBounds', () => {
  it('should return the outer bounds for the list of bounds provided', () => {
    expect(calculateOuterBounds(listOfBounds)).toStrictEqual([
      [-24.1625706, 177.04791360000002],
      [4.9, 186.4704542],
    ]);
  });
});
