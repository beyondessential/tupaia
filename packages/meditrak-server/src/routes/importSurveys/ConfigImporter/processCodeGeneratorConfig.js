/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { CODE_GENERATORS } from '../codeGenerators';

const DEFAULT_CODE_GENERATOR = CODE_GENERATORS.MONGO_ID;

export const processCodeGeneratorConfig = config => ({ type: DEFAULT_CODE_GENERATOR, ...config });
