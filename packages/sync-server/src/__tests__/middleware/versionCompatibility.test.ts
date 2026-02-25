import type { NextFunction, Request, Response } from 'express';

import { versionCompatibility } from '../../middleware/versionCompatibility';

const OUTDATED_CLIENT_MESSAGE =
  /Please reload to get the latest version of Tupaia DataTrak \(v(\d+\.){2}\d+\) before syncing\./;

const mockRequest = (headers: Record<string, string> = {}): Partial<Request> => ({
  header: ((name: string) => headers[name] ?? undefined) as Request['header'],
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.setHeader = jest.fn().mockReturnThis();
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
      jest.doMock('../../../package.json', () => ({ version: '2.0.0' }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.setHeader).toHaveBeenCalledWith('X-Required-Client-Version', '2.0.0');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(OUTDATED_CLIENT_MESSAGE),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 400 and message matching pattern for minor version discrepancy', () => {
      jest.doMock('../../../package.json', () => ({ version: '1.1.0' }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.setHeader).toHaveBeenCalledWith('X-Required-Client-Version', '1.1.0');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(OUTDATED_CLIENT_MESSAGE),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond with 400 and message matching pattern for patch version discrepancy', () => {
      jest.doMock('../../../package.json', () => ({ version: '1.0.1' }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': '1.0.0' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn() as jest.MockedFunction<NextFunction>;

      versionCompatibility(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.setHeader).toHaveBeenCalledWith('X-Required-Client-Version', '1.0.1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(OUTDATED_CLIENT_MESSAGE),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
