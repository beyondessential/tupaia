import * as fs from 'node:fs';
import * as path from 'node:path';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import type { Runnable } from '@langchain/core/runnables';

import { requireEnv } from '@tupaia/utils';

interface Chains {
  presentationOptions: Runnable;
}

export class PromptManager {
  private model: ChatAnthropic;
  private chains: Chains;

  constructor() {
    this.model = new ChatAnthropic({
      anthropicApiKey: `${requireEnv('LLM_API_KEY_PREFIX')}${requireEnv('LLM_API_KEY_BODY')}`,
      model: requireEnv('LLM_ID'),
    });
    this.chains = this.initializeChains();
  }

  initializeChains(): Chains {
    return {
      presentationOptions: this.createPresentationOptionsChain(),
    };
  }

  createPresentationOptionsChain(): Runnable {
    const presentationOptionsContextPath = path.join(
      __dirname,
      'context/presentationOptionsContext.txt',
    );
    const presentationOptionsContext = fs.readFileSync(presentationOptionsContextPath, 'utf8');

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(presentationOptionsContext),
      HumanMessagePromptTemplate.fromTemplate(
        `My chart description is: {chartDescription}. 
        My data structure is: {dataStructure}. 
        My existing presentation options are: {presentationOptions}`,
      ),
    ]);
    return prompt.pipe(this.model);
  }

  async generatePresentationConfig(
    chartDescription: string,
    dataStructure: string,
    presentationOptions: string,
  ) {
    return this.chains.presentationOptions.invoke({
      chartDescription,
      dataStructure,
      presentationOptions,
    });
  }
}
