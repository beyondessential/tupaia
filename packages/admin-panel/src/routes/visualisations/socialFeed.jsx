/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

const Image = styled.div`
  height: 200px;
  width: 200px;
  background-image: url(${props => props.$src});
  background-size: contain;
  background-repeat: no-repeat;
`;

const ImagePreview = row => {
  if (row.value && row.value.title) {
    return (
      <div>
        <Typography variant="h3">{row.value.title}</Typography>
        <Image $src={row.value.image} alt={row.value.title} />
        <div>{row.value.body}</div>
      </div>
    );
  }

  return null;
};

const FIELDS = [
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
          type: 'image',
          avatarVariant: 'square',
          deleteModal: {
            title: 'Remove Feed Item Image',
            message: 'Are you sure you want to delete your image?',
          },
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
    Cell: ImagePreview,
  },
];

export const SOCIAL_FEED_COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Social Feed item',
      editEndpoint: 'feedItems',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
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
export const socialFeed = {
  title: 'Social feed',
  path: '/social-feed',
  endpoint: 'feedItems',
  baseFilter: { type: 'markdown' },
  columns: SOCIAL_FEED_COLUMNS,
  createConfig: CREATE_CONFIG,
  onProcessDataForSave: data => ({ ...data, type: 'markdown' }),
  isBESAdminOnly: true,
};
