import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { PresentationOptionsPromptRequest as PresentationOptionsPromptRequestType } from '@tupaia/types';

export type PresentationOptionsPromptRequest = Request<
  PresentationOptionsPromptRequestType.Params,
  PresentationOptionsPromptRequestType.ResBody,
  PresentationOptionsPromptRequestType.ReqBody,
  PresentationOptionsPromptRequestType.ReqQuery
>;

export class PresentationOptionsPromptRoute extends Route<PresentationOptionsPromptRequest> {
  public async buildResponse() {
    const { body } = this.req;
    const { inputMessage, dataStructure, presentationOptions } = body;
    const { promptManager } = this.req.ctx;

    const response = await promptManager.generatePresentationConfig(
      inputMessage,
      '```json\n' + JSON.stringify(dataStructure) + '\n```',
      '```json\n' + JSON.stringify(presentationOptions) + '\n```',
    );

    return JSON.parse(response.content.toString());
  }
}
