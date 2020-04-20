/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { LightProfileButton } from '../components/ProfileButton';

export default {
  title: 'DropdownMenu',
};

const DropdownMenu = () => (
  <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>
);
