export const fetchRequestingMeditrakDevice = async req => {
  const { models, refreshToken } = req;
  const refreshTokenRecord = await models.refreshToken.findOne({ token: refreshToken });

  return refreshTokenRecord && refreshTokenRecord.meditrakDevice();
};
