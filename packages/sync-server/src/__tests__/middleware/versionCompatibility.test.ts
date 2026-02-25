import type { NextFunction, Request, Response } from 'express';

import { versionCompatibility } from '../../middleware/versionCompatibility';

const mockRequest = (headers: Record<string, string> = {}): Partial<Request> => ({
  header: ((name: string) => headers[name] ?? undefined) as Request['header'],
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('versionCompatibility', () => {
  it('should respond with 400 if `X-Client-Version` header is missing', () => {
    const req = mockRequest() as Request;
    const res = mockResponse() as Response;
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    versionCompatibility(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing X-Client-Version header. This is required for sync.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 400 if `X-Client-Version` header is not a valid semver', () => {
    const invalidVersion = 'not-a-version';
    const req = mockRequest({ 'X-Client-Version': invalidVersion }) as Request;
    const res = mockResponse() as Response;
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    versionCompatibility(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: `Malformed X-Client-Version header. “${invalidVersion}” isn’t a valid semver number`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should not error if the versions match', () => {
    const { version } = require('../../../package.json');

    const req = mockRequest({ 'X-Client-Version': version }) as Request;
    const res = mockResponse() as Response;
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    versionCompatibility(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  describe('when client version is older than the server', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should respond with 400 and message matching pattern for major version discrepancy', () => {
      const serverVersion = '2.0.0';
      jest.doMock('../../../package.json', () => ({ version: serverVersion }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: `Please reload to get the latest version of Tupaia DataTrak (v${serverVersion}) before syncing`,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 400 and message matching pattern for minor version discrepancy', () => {
      const serverVersion = '1.1.0';
      jest.doMock('../../../package.json', () => ({ version: serverVersion }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: `Please reload to get the latest version of Tupaia DataTrak (v${serverVersion}) before syncing`,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 400 and message matching pattern for patch version discrepancy', () => {
      const serverVersion = '1.0.1';
      jest.doMock('../../../package.json', () => ({ version: serverVersion }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: `Please reload to get the latest version of Tupaia DataTrak (v${serverVersion}) before syncing`,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
