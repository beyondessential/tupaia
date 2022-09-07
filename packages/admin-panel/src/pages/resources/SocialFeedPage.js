/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ResourcePage } from './ResourcePage';

const FIELDS = [
  {
    Header: 'Country',
    source: 'country.name',
    editConfig: {
      optionsEndpoint: 'countries',
    },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
    },
  },
  {
    Header: 'Creation date',
    source: 'creation_date',
    type: 'tooltip',
    accessor: row => moment(row.creation_date).local().toString(),
    editConfig: {
      type: 'datetime-local',
    },
  },
  {
    Header: 'Feed item',
    source: 'template_variables',
    editConfig: {
      type: 'json',
      getJsonFieldSchema: () => [
        {
          label: 'Title',
          fieldName: 'title',
        },
        {
          label: 'Image',
          fieldName: 'image',
        },
        {
          label: 'Body (accepts basic markdown)',
          fieldName: 'body',
          type: 'textarea',
        },
        {
          label: 'Link',
          fieldName: 'link',
        },
      ],
    },
    Cell: row => {
      if (row.value && row.value.title) {
        return (
          <div>
            <Typography variant="h3">{row.value.title}</Typography>
            <img src={row.value.image} alt={row.value.title} />
            <div>{row.value.body}</div>
          </div>
        );
      }

      return null;
    },
  },
];

export const SOCIAL_FEED_COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      title: 'Edit Social Feed item',
      editEndpoint: 'feedItems',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'feedItems',
    },
  },
];

const CREATE_CONFIG = {
  title: 'Add Social Feed item',
  actionConfig: {
    editEndpoint: 'feedItems',
    fields: FIELDS,
  },
};

export const SocialFeedPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Social Feed"
    endpoint="feedItems"
    baseFilter={{ type: 'markdown' }}
    columns={SOCIAL_FEED_COLUMNS}
    createConfig={CREATE_CONFIG}
    onProcessDataForSave={data => ({ ...data, type: 'markdown' })}
    getHeaderEl={getHeaderEl}
  />
);

SocialFeedPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
