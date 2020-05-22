import { expect } from 'chai';
import { Service } from '../../services/Service';

describe('Service', () => {
  const service = new Service();

  it('push()', () => expect(service.push()).to.be.rejectedWith(/must implement.*push/));

  it('delete()', () => expect(service.delete()).to.be.rejectedWith(/must implement.*delete/));

  it('pull()', () => expect(service.pull()).to.be.rejectedWith(/must implement.*pull/));
});
