/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { FeedItem as BaseFeedItem } from '../../models';
import { FeedItemTemplateVariables } from '../../models-extra';

type FeedItem = Omit<BaseFeedItem, 'template_variables'> & {
  template_variables?: FeedItemTemplateVariables;
};
type CamelCaseFeedItem = KeysToCamelCase<FeedItem>;

export type Params = Record<string, never>;
export type ResBody = {
  pageNumber: number;
  hasMorePages: boolean;
  items: CamelCaseFeedItem[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReqBody = Record<string, any>;
export type ReqQuery = Record<string, never>;
