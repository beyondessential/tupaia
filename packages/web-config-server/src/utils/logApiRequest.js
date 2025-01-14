export const logApiRequest = (models, apiName, version) => async (req, res, next) => {
  const userId = req.session?.userJson?.userId;
  const { id: apiRequestLogId } = await models.apiRequestLog.create({
    version,
    api: apiName,
    method: req.method,
    endpoint: req.path,
    query: req.query,
    user_id: userId,
  });
  req.apiRequestLogId = apiRequestLogId;
  next();
};
