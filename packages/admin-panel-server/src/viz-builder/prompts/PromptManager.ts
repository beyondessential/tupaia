import * as fs from 'fs';
import * as path from 'path';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';

interface Chains {
  presentationOptions: Runnable;
}

export class PromptManager {
  private model: ChatAnthropic;
  private chains: Chains;

  constructor() {
    this.model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
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
        'My chart description is: {chartDescription}. My data structure is: {dataStructure}',
      ),
    ]);
    return prompt.pipe(this.model);
  }

  async generatePresentationConfig(chartDescription: string, dataStructure: string) {
    return this.chains.presentationOptions.invoke({ chartDescription, dataStructure });
  }
}
