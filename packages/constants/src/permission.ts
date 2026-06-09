export const ADMIN_PERMISSION_GROUP = 'Public';
export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
export const PUBLIC_PERMISSION_GROUP = 'Public';
export const TUPAIA_ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';
export const VIZ_BUILDER_PERMISSION_GROUP = 'Viz Builder User';

export const API_CLIENT_PERMISSIONS = [
  { entityCode: 'AU', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Australia
  { entityCode: 'CK', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Cook Islands
  { entityCode: 'DL', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Demo Land
  { entityCode: 'FJ', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Fiji
  { entityCode: 'KI', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Kiribati
  { entityCode: 'NG', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Nigeria
  { entityCode: 'NU', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Niue
  { entityCode: 'PW', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Palau
  { entityCode: 'PG', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Papua New Guinea
  { entityCode: 'WS', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Samoa
  { entityCode: 'SB', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Solomon Islands
  { entityCode: 'TK', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Tokelau
  { entityCode: 'TO', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Tonga
  { entityCode: 'TV', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Tuvalu
  { entityCode: 'VU', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Vanuatu
  { entityCode: 'VE', permissionGroupName: PUBLIC_PERMISSION_GROUP }, //	Venezuela
] as const;
