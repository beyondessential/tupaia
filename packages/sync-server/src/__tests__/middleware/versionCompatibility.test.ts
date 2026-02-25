import type { NextFunction, Request, Response } from 'express';

import { versionCompatibility } from '../../middleware/versionCompatibility';

const mockRequest = (headers: Record<string, string> = {}) =>
  ({
    header: ((name: string) => headers[name] ?? undefined) as Request['header'],
  }) as Partial<Request> as Request;

const mockResponse = () =>
  ({
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }) as Partial<Response> as Response;

const mockNextFunction = jest.fn() as jest.MockedFunction<NextFunction>;

describe('versionCompatibility', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  describe('malformed request header', () => {
    it('should respond with 400 if `X-Client-Version` header is missing', () => {
      const req = mockRequest();
      const res = mockResponse();

      versionCompatibility(req, res, mockNextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing X-Client-Version header. This is required for sync.',
      });
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should respond with 400 if `X-Client-Version` header is not a valid semver', () => {
      const invalidVersion = 'not-a-version';
      const req = mockRequest({ 'X-Client-Version': invalidVersion });
      const res = mockResponse();

      versionCompatibility(req, res, mockNextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: `Malformed X-Client-Version header. “${invalidVersion}” isn’t a valid semver number.`,
      });
      expect(mockNextFunction).not.toHaveBeenCalled();
    });
  });

  describe('version discrepancy between client and server', () => {
    it.each([
      ['0.0.0', '1.0.0', 'client major version is older'],
      ['0.0.0', '0.1.0', 'client minor version is older'],
      ['0.0.0', '0.0.1', 'client patch version is older'],
      // Cases below are never expected to occur in practice
      ['1.0.0', '0.0.0', 'client major version is newer'],
      ['0.1.0', '0.0.0', 'client minor version is newer'],
      ['0.0.1', '0.0.0', 'client patch version is newer'],
    ])('should respond with 400 if $description', (clientVersion, serverVersion, _description) => {
      jest.doMock('../../../package.json', () => ({ version: serverVersion }));
      const { versionCompatibility } = require('../../middleware/versionCompatibility');

      const req = mockRequest({ 'X-Client-Version': clientVersion });
      const res = mockResponse();

      versionCompatibility(req, res, mockNextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: `Please reload to get the latest version of Tupaia DataTrak (v${serverVersion}) before syncing`,
      });
      expect(mockNextFunction).not.toHaveBeenCalled();
    });
  });

  it.only('should not error if the versions match', () => {
    const version = '10.10.10';
    jest.doMock('../../../package.json', () => ({ version }));
    const { versionCompatibility } = require('../../middleware/versionCompatibility');

    const req = mockRequest({ 'X-Client-Version': version });
    const res = mockResponse();

    versionCompatibility(req, res, mockNextFunction);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(mockNextFunction).toHaveBeenCalled();
  });
});
