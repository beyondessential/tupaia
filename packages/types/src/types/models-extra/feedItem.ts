/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
export enum FeedItemTypes {
  SurveyResponse = 'SurveyResponse',
  Markdown = 'markdown',
}
export type SurveyResponseTemplateVariables = {
  surveyName?: string;
  countryName?: string;
  regionName?: string;
  imageUrl?: string;
  link?: string;
  authorName?: string;
};

export type MarkdownTemplateVariables = {
  title?: string;
  image?: string;
  body?: string;
  link?: string;
};

export type FeedItemTemplateVariables = SurveyResponseTemplateVariables | MarkdownTemplateVariables;
