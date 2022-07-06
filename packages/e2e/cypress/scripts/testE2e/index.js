#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { runScript } from '@tupaia/utils';
import { testE2e } from './testE2e';

runScript(testE2e);
