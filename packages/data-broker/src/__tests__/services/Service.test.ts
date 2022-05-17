import { Service } from '../../services/Service';

describe('Service', () => {
  const service = new Service();

  it('push()', () => expect(service.push()).toBeRejectedWith(/must implement.*push/));

  it('delete()', () => expect(service.delete()).toBeRejectedWith(/must implement.*delete/));

  it('pull()', () => expect(service.pull()).toBeRejectedWith(/must implement.*pull/));
});
