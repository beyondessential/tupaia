import generate from 'nanoid/non-secure/generate';
import generateUUID from 'bson-objectid';
import { CodeGeneratorQuestionConfig } from '@tupaia/types';

// With this config, in order to reach a 1% probability of at least one collision:
// You would need: 1000 IDs generated per hour for ~211 years.
// You can test different configs collision probability here: https://zelark.github.io/nano-id-cc/

const DEFAULT_SHORT_ID_CONFIG = {
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  length: 13,
  chunkLength: 3,
  prefix: '',
};

export const SHORT_ID = 'shortid';
export const MONGO_ID = 'mongoid';

// e.g. '632-NFO-LEU-I1QI'
export const generateShortId = (codeGeneratorConfig?: CodeGeneratorQuestionConfig) => {
  // Use defaults for any missing config params, allowing users to specify some or all custom configurations
  const { alphabet, length, chunkLength, prefix } = {
    ...DEFAULT_SHORT_ID_CONFIG,
    ...codeGeneratorConfig,
  };

  // will match every {chunkLength} characters, including remainders
  // i.e. '632NFOLEUI1QI'.match(pattern) -> ['632', 'NFO', 'LEU', 'I1Q', 'I']
  const pattern = new RegExp(`.{1,${chunkLength}}`, 'g');

  const id: string = generate(alphabet, length);
  // Reducing rather than joining here to merge remainder characters
  // into last chunk, creating a larger tail chunk rather than smaller.
  const chunkedId = id.match(pattern)!.reduce((prev, curr) => {
    if (curr.length < chunkLength) return `${prev}${curr}`;
    return `${prev}-${curr}`;
  });

  if (prefix.length > 0) return `${prefix}-${chunkedId}`;
  return chunkedId;
};

// Generate mongo-document style id (same style that Tupaia generates).
export const generateMongoId = () => new generateUUID().toString();
