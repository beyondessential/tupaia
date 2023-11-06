/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { FeedItem as BaseFeedItem } from '@tupaia/types';
import { UseInfiniteQueryResult } from 'react-query';

type TemplateVariables = Record<string, any> & {
  surveyName?: string;
  countryName?: string;
  regionName?: string;
  imageUrl?: string;
  link?: string;
  authorName?: string;
};

export type FeedItem = Omit<BaseFeedItem, 'template_variables'> & {
  template_variables: TemplateVariables;
};

export type ActivityFeedResponse = {
  items?: FeedItem[];
  pageNumber?: number;
  hasMorePages?: boolean;
};
