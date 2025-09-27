import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import {
  CountryModel,
  DashboardItemModel,
  DashboardMailingListEntryModel,
  DashboardModel,
  DashboardRelationModel,
  EntityModel,
  MapOverlayGroupModel,
  MapOverlayGroupRelationModel,
  ProjectModel,
  UserModel,
} from '@tupaia/server-boilerplate';

export interface TupaiaWebServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly country: CountryModel;
  readonly dashboard: DashboardModel;
  readonly dashboardItem: DashboardItemModel;
  readonly dashboardMailingListEntry: DashboardMailingListEntryModel;
  readonly dashboardRelation: DashboardRelationModel;
  readonly entity: EntityModel;
  readonly mapOverlayGroup: MapOverlayGroupModel;
  readonly mapOverlayGroupRelation: MapOverlayGroupRelationModel;
  readonly user: UserModel;
  readonly project: ProjectModel;
}
