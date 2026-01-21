import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { PresentationOptionsPromptRequest as PresentationOptionsPromptRequestType } from '@tupaia/types';

export type PresentationOptionsPromptRequest = Request<
  PresentationOptionsPromptRequestType.Params,
  PresentationOptionsPromptRequestType.ResBody,
  PresentationOptionsPromptRequestType.ReqBody,
  PresentationOptionsPromptRequestType.ReqQuery
>;

const openingFence = '```json\n';
const closingFence = '\n```';

function fence(obj: any) {
  return `${openingFence}${JSON.stringify(obj)}${closingFence}`;
}

function unfence(str: string) {
  const trimmed = str.trim();
  const isFenced = trimmed.startsWith(openingFence) && trimmed.endsWith(closingFence);
  return isFenced ? trimmed.slice(openingFence.length, -closingFence.length) : trimmed;
}

export class PresentationOptionsPromptRoute extends Route<PresentationOptionsPromptRequest> {
  public async buildResponse() {
    const {
      body: { dataStructure, inputMessage, presentationOptions },
      ctx: { promptManager },
    } = this.req;

    const response = await promptManager.generatePresentationConfig(
      inputMessage,
      fence(dataStructure),
      fence(presentationOptions),
    );

    const completion = response.content.toString();
    return JSON.parse(unfence(completion));
  }
}
