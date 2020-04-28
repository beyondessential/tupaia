/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryModel } from './Country';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { GeographicalAreaModel } from './GeographicalArea';
import { RefreshTokenModel } from './RefreshToken';
import { MeditrakDeviceModel } from './MeditrakDevice';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Country: CountryModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  GeographicalArea: GeographicalAreaModel,
  MeditrakDevice: MeditrakDeviceModel,
  RefreshToken: RefreshTokenModel,
};

// export any models and types that are extended in other packages
export { CountryModel } from './Country';
export { GeographicalAreaModel } from './GeographicalArea';
export { MeditrakDeviceModel } from './MeditrakDevice';
export { DataSourceModel } from './DataSource';
