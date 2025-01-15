import { VizTestToolScript } from './VizTestToolScript';
import { configureEnv } from './configureEnv';

configureEnv();
new VizTestToolScript().run();
