import * as watchDashboard from './watchDashboard';
import * as watchMapOverlay from './watchMapOverlay';
import * as watchOrgUnit from './watchOrgUnit';
import * as watchProject from './watchProject';
import * as watchUser from './watchUser';
import * as watchSearchbar from './watchSearchbar';

export default [
  ...Object.values(watchDashboard),
  ...Object.values(watchMapOverlay),
  ...Object.values(watchOrgUnit),
  ...Object.values(watchProject),
  ...Object.values(watchUser),
  ...Object.values(watchSearchbar),
];
