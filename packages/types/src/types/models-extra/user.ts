/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { Country, Entity, Project } from '../models';
import { EntityType } from './entityType';

type RecentEntitiesForCountry = Partial<Record<EntityType, Entity['id'][]>>;

export type UserAccountPreferences = {
  country_id?: Entity['id'];
  project_id?: Project['id'];
  recent_entities?: Record<Country['code'], RecentEntitiesForCountry>;
};
