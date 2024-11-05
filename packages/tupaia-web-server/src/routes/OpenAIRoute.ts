/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import OpenAI from 'openai';
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export interface Params {
  entityCode: string;
  projectCode: string;
}
export type ResBody = Record<string, string>;
export type ReqBody = Record<string, never>;
export interface ReqQuery {}

export type OpenAIRequest = Request<Params, ResBody, ReqBody, ReqQuery>;

const apiKey = process.env.OPENAI_API_KEY;

export class OpenAIRoute extends Route<OpenAIRequest> {
  public async buildResponse() {
    const { userPrompt, systemPrompt } = this.req.body;

    const openAIClient = new OpenAI({
      apiKey,
    });

    const completion = await openAIClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        },
        { role: 'user', content: JSON.stringify(userPrompt) },
      ],
      model: 'gpt-3.5-turbo',
    });

    return { message: completion.choices[0].message as unknown as string };
  }
}
