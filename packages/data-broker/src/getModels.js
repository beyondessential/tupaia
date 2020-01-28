/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { modelClasses as baseModelClasses, createModelRegistry } from '@tupaia/database';

import { modelClasses } from './modelClasses';

export const getModels = () => createModelRegistry({ ...baseModelClasses, ...modelClasses });
