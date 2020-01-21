import { expect } from 'chai';
import { Service } from '../../services/Service';

describe('Service', () => {
  it('push()', () => {
    const service = new Service();
    expect(() => service.push()).to.throw(/must implement.*push/);
  });

  it('pull()', () => {
    const service = new Service();
    expect(() => service.pull()).to.throw(/must implement.*pull/);
  });
});
