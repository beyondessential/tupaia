import { ExpressionParser } from '@tupaia/expression-parser';

let parserInstance: ExpressionParser | null = null;

/**
 * Creating a new `ExpressionParser` instance takes around 20-30ms. This can have a significant
 * performance impact when building data for nested indicators, where ExpressionParser would
 * be independently instantiated multiple times.
 *
 * We can safely use a Singleton pattern since the creation of ExpressionParser is not coupled to
 * specific app data/logic
 */
export const getExpressionParserInstance = () => {
  if (!parserInstance) {
    parserInstance = new ExpressionParser();
  }
  return parserInstance;
};
