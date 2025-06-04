import { Request } from 'express';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import * as fs from 'fs';
import * as path from 'path';

import { Route } from '@tupaia/server-boilerplate';
import { PromptMessageRequest as PromptMessageRequestType } from '@tupaia/types';
import { HumanMessage } from '@langchain/core/messages';

export type PromptMessageRequest = Request<
  PromptMessageRequestType.Params,
  PromptMessageRequestType.ResBody,
  PromptMessageRequestType.ReqBody,
  PromptMessageRequestType.ReqQuery
>;

export class PromptMessageRoute extends Route<PromptMessageRequest> {
  public async buildResponse() {
    const { body } = this.req;
    const { inputMessage, dataStructure } = body;
    const presentationConfigContextPath = path.join(
      __dirname,
      '../viz-builder/ai/presentationConfigContext.txt',
    );
    const presentationConfigContext = fs.readFileSync(presentationConfigContextPath, 'utf8');

    const model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(presentationConfigContext),
      HumanMessagePromptTemplate.fromTemplate(
        'My chart description is: {chartDescription}. My data structure is: {dataStructure}',
      ),
    ]);

    const chain = chatPrompt.pipe(model);

    const response = await chain.invoke({
      chartDescription: inputMessage,
      dataStructure: '```json\n' + JSON.stringify(dataStructure) + '\n```',
    });

    return JSON.parse(response.content.toString());
  }
}
