/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { doesValueExist } from './doesValueExist';

export const doesIdExist = (collection, id) => doesValueExist(collection, 'id', id);
