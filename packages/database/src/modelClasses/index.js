/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryModel } from './Country';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { GeographicalAreaModel } from './GeographicalArea';
import { RefreshTokenModel } from './RefreshToken';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Country: CountryModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  GeographicalArea: GeographicalAreaModel,
  RefreshToken: RefreshTokenModel,
};

// export any models and types that are extended in other packages
export { CountryModel } from './Country';
export { GeographicalAreaModel } from './GeographicalArea';
export { RefreshTokenModel, RefreshTokenType } from './RefreshToken';
