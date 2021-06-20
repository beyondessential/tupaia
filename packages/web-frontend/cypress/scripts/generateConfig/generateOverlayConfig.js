import { uniq } from 'lodash';

import { compareAsc, stringifyQuery } from '@tupaia/utils';
import config from '../../config.json';
import { readJsonFile } from './helpers';

const buildUrl = urlInput => {
  if (typeof urlInput === 'string') {
    return urlInput;
  }

  const { id, project, orgUnit } = urlInput;
  const path = [project, orgUnit].map(encodeURIComponent).join('/');
  const queryParams = { overlay: id };

  return stringifyQuery('', path, queryParams);
};

const generateUrlsUsingOptions = async options => {
  return [];
};

export const generateOverlayConfig = async () => {
  const { mapOverlays: overlayConfig } = config;

  const { urlFiles, urlGenerationOptions = {}, urls = [], ...otherConfig } = overlayConfig;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  const generatedUrls = await generateUrlsUsingOptions(urlGenerationOptions);
  const allUrls = [...urlsFromFiles, ...generatedUrls, ...urls];

  return {
    ...otherConfig,
    urls: uniq(allUrls.map(buildUrl)).sort(compareAsc),
  };
};
