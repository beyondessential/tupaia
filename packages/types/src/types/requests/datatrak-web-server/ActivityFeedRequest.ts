/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils/casing';
import { FeedItem as BaseFeedItem } from '../../models';
import {
  FeedItemTemplateVariables,
  FeedItemTypes,
  MarkdownTemplateVariables,
} from '../../models-extra';

type FeedItem = Omit<BaseFeedItem, 'template_variables'> & {
  template_variables?: FeedItemTemplateVariables;
};
type CamelCaseFeedItem = KeysToCamelCase<FeedItem>;

export type Params = Record<string, never>;
export type ResBody = {
  pageNumber: number;
  hasMorePages: boolean;
  items: CamelCaseFeedItem[];
  pinned?: Omit<CamelCaseFeedItem, 'type' | 'templateVariables'> & {
    type: FeedItemTypes.Markdown;
    templateVariables: MarkdownTemplateVariables;
  };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReqBody = Record<string, any>;
export type ReqQuery = {
  projectId: string;
  page?: string;
};
