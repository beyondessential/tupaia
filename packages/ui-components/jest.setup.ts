interface GeolocationPositionError {
  readonly code: number;
  readonly message: string;
  readonly PERMISSION_DENIED: 1;
  readonly POSITION_UNAVAILABLE: 2;
  readonly TIMEOUT: 3;
}

declare var GeolocationPositionError: {
  prototype: GeolocationPositionError;
  new (): GeolocationPositionError;
  readonly PERMISSION_DENIED: 1;
  readonly POSITION_UNAVAILABLE: 2;
  readonly TIMEOUT: 3;
};

beforeAll(() => {
  jest
    .spyOn(global, 'GeolocationPositionError')
    .mockImplementation(() => new GeolocationPositionError());
});

afterAll(() => {
  jest.restoreAllMocks();
});
