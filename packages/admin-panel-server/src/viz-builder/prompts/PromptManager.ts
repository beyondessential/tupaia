import * as fs from 'fs';
import * as path from 'path';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';

export class PromptManager {
  private model: ChatAnthropic;
  private chains: {
    presentationOptions: Runnable;
  };

  constructor() {
    this.model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL,
    });
    this.chains = this.initializeChains();
  }

  initializeChains() {
    return {
      presentationOptions: this.createPresentationOptionsChain(),
    };
  }

  createPresentationOptionsChain() {
    const presentationConfigContextPath = path.join(
      __dirname,
      'presentationConfigContext.txt',
    );
    const presentationConfigContext = fs.readFileSync(presentationConfigContextPath, 'utf8');

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(presentationConfigContext),
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
