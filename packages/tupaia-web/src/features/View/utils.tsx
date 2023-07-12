/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ViewConfig } from '@tupaia/types';
import { ViewReport, ViewDataItem } from '../../types';
import { SingleValue } from './SingleValue';
import { SingleDate } from './SingleDate';
import { SingleDownloadLink } from './SingleDownloadLink';

const SINGLE_VALUE_COMPONENTS = ['singleValue', 'singleDate', 'singleDownloadLink'];

export const VIEWS = {
  singleValue: SingleValue,
  singleDate: SingleDate,
  singleDownloadLink: SingleDownloadLink,
};

export const transformContentForViewType = (report: ViewReport, config: ViewConfig) => {
  const { viewType } = config;
  const { data } = report;
  if (viewType === 'multiSingleValue') {
    return data?.map((datum: ViewDataItem) => ({
      config: {
        ...config,
        viewType: datum.viewType || 'singleValue',
      },
      report: {
        ...report,
        data: [datum],
      },
    }));
  }
  return [
    {
      config,
      report,
    },
  ];
};

export const transformDownloadLink = (resourceUrl: string) => {
  const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';
  if (resourceUrl.includes('http')) return resourceUrl;
  return `${baseUrl}${resourceUrl}`;
};
