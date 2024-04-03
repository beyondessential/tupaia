/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { VizTestToolScript } from './VizTestToolScript';
import { configureEnv } from './configureEnv';

configureEnv();
new VizTestToolScript().run();
