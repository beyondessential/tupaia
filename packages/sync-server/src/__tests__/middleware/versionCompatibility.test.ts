import type { NextFunction, Request, Response } from 'express';
import { versionCompatibility } from '../../middleware/versionCompatibility';

const mockReadFileSync = jest.fn(() => JSON.stringify({ version: '0.0.0' }));

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
  jest.mock('node:fs', () => ({ readFileSync: mockReadFileSync }));

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
      ['client major version is older', '0.0.0', '1.0.0'],
      ['client minor version is older', '0.0.0', '0.1.0'],
      ['client patch version is older', '0.0.0', '0.0.1'],
      // Cases below are never expected to occur in practice
      ['client major version is newer', '1.0.0', '0.0.0'],
      ['client minor version is newer', '0.1.0', '0.0.0'],
      ['client patch version is newer', '0.0.1', '0.0.0'],
    ])('should respond with 400 if %s', (_description, clientVersion, serverVersion) => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: serverVersion }));
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

  it('should not error if the versions match', () => {
    const version = '10.10.10';
    mockReadFileSync.mockReturnValue(JSON.stringify({ version }));
    const { versionCompatibility } = require('../../middleware/versionCompatibility');

    const req = mockRequest({ 'X-Client-Version': version });
    const res = mockResponse();

    versionCompatibility(req, res, mockNextFunction);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(mockNextFunction).toHaveBeenCalled();
  });
});
