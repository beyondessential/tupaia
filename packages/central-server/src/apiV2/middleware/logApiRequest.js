import { extractRefreshTokenFromReq } from '@tupaia/auth';

export const logApiRequest = async (req, res, next) => {
  const refreshToken = await extractRefreshTokenFromReq(req);
  const { id: apiRequestLogId } = await req.models.apiRequestLog.create({
    version: 2, // only version that can get through current route handling
    api: 'central',
    method: req.method,
    endpoint: req.path,
    user_id: req.userId,
    query: req.query,
    refresh_token: refreshToken,
  });
  req.apiRequestLogId = apiRequestLogId;
  req.refreshToken = refreshToken;
  next();
};
