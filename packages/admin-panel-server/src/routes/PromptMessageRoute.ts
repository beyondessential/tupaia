import { Request } from 'express';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';

import { Route } from '@tupaia/server-boilerplate';
import { PromptMessageRequest as PromptMessageRequestType } from '@tupaia/types';

export type PromptMessageRequest = Request<
  PromptMessageRequestType.Params,
  PromptMessageRequestType.ResBody,
  PromptMessageRequestType.ReqBody,
  PromptMessageRequestType.ReqQuery
>;

export class PromptMessageRoute extends Route<PromptMessageRequest> {
  public async buildResponse() {
    const model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    });

    const response = await model.invoke([new HumanMessage('Hello Claude!')]);
    return { content: response.content };
  }
}
