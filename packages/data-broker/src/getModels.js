/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { modelClasses, setupModelRegistry } from '@tupaia/database';

export const getModels = () => setupModelRegistry(modelClasses);
