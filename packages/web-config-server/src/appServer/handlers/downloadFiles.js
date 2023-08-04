import { fetchFromCentralServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Function will download files
 */
export const downloadFiles = async req => {
  const { models, query } = req;
  const { userName } = req.userJson;
  const endpoint = 'downloadFiles';

  return fetchFromCentralServerUsingTokens(models, endpoint, null, query, userName);
};
