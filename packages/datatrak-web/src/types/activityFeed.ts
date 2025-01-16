import {
  DatatrakWebActivityFeedRequest,
  FeedItemTypes,
  MarkdownTemplateVariables,
  SurveyResponseTemplateVariables,
} from '@tupaia/types';

export type FeedItem = DatatrakWebActivityFeedRequest.ResBody['items'][0];

export type SurveyResponseFeedItem = Omit<FeedItem, 'type' | 'templateVariables'> & {
  type: FeedItemTypes.SurveyResponse;
  templateVariables: SurveyResponseTemplateVariables;
};

export type MarkdownFeedItem = Omit<FeedItem, 'type' | 'templateVariables'> & {
  type: FeedItemTypes.Markdown;
  templateVariables: MarkdownTemplateVariables;
};
