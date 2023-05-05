import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@material-ui/core';
import { SECTION_FIELD_TYPE } from '../../editor/constants';
import { ResourcePage } from './ResourcePage';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const LANDING_PAGES_ENDPOINT = 'landingPages';

// the URL prefix to display in the url_segment field
const URL_PREFIX = window.location.origin.replace('admin', 'www');

const DISPLAY_URL_PREFIX = `${URL_PREFIX.replace(new RegExp('(https://)|(http://)'), '')}/`;

// All the fields for create/edit of a custom landing page
const FIELDS = [
  {
    type: SECTION_FIELD_TYPE,
    fields: [
      {
        Header: 'Name',
        source: 'name',
        // this is to denote this field as a column in the table
        column: {
          // sets what order to put the column in the table
          sortOrder: 0,
        },
      },
      {
        Header: 'Add name to header title (optional)',
        source: 'include_name_in_header',
        editConfig: {
          type: 'checkbox',
          name: 'include_name_in_header',
          // the value that will be sent to the server if the checkbox is checked
          optionValue: true,
          labelTooltip: 'Check this if your logo does not include a name',
        },
      },
      {
        Header: 'Custom link',
        source: 'url_segment',
        isColumn: true,
        // this is to mark this field as being non-editable (disabled in edit mode)
        updateDisabled: true,
        column: {
          sortOrder: 2,
        },
        // format the value to include the URL prefix in the table, and display as a clickable link
        // eslint-disable-next-line react/prop-types
        Cell: ({ value }) => (
          <Link
            href={`${URL_PREFIX}/${value}`}
            target="_blank"
          >{`${DISPLAY_URL_PREFIX}${value}`}</Link>
        ),
        editConfig: {
          // the prefix to display in the field
          startAdornment: DISPLAY_URL_PREFIX,
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'Add main image',
    description: '(2000px x 2000px)',
    fields: [
      {
        Header: 'Main image',
        source: 'image_url',
        editConfig: {
          type: 'image',
          avatarVariant: 'square',
          deleteModal: {
            title: 'Remove landing page image',
            message: 'Are you sure you want to delete your image?',
          },
          maxHeight: 2000,
          maxWidth: 2000,
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'Add logo image',
    description: '(800px x 800px)',
    fields: [
      {
        Header: 'Logo image',
        source: 'logo_url',
        editConfig: {
          type: 'image',
          avatarVariant: 'square',
          deleteModal: {
            title: 'Remove logo image',
            message: 'Are you sure you want to delete your image?',
          },
          maxHeight: 800,
          maxWidth: 800,
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'Primary colour',
    description:
      'This colour will be used for the header bar and other details. If no colour is specified a default colour will be applied.',
    fields: [
      {
        Header: 'Primary colour hex code',
        source: 'primary_hexcode',
        editConfig: {
          type: 'hexcode',
        },
      },
    ],
  },
  {
    title: 'Secondary colour',
    description:
      'This colour will be used for text and other accents. Please select the option that provides the most contrast to your primary colour. If no colour is specified a default colour will be applied.',
    type: SECTION_FIELD_TYPE,
    fields: [
      {
        Header: 'Secondary colour',
        source: 'secondary_hexcode',
        editConfig: {
          type: 'radio',
          name: 'secondary_hexcode',
          options: [
            {
              label: 'White',
              value: '#FFFFFF',
            },
            {
              label: 'Black',
              value: '#000000',
            },
          ],
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    fields: [
      {
        Header: 'Extended title (max 60 characters)',
        source: 'extended_title',
        editConfig: {
          maxLength: 60,
          type: 'text',
          placeholder: 'A short sentence about your project',
        },
      },
      {
        Header: 'Long bio (max 250 characters)',
        source: 'long_bio',
        editConfig: {
          maxLength: 250,
          type: 'textarea',
          placeholder: 'A longer bio about your project',
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'Contact information',
    description: 'Add contact information you would like to show on the landing page.',
    fields: [
      {
        Header: 'Phone',
        source: 'phone_number',
      },
      {
        Header: 'Website',
        source: 'website_url',
        editConfig: {
          placeholder: 'www.example.com',
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'External link',
    description: 'Add an external link where users can learn more about your project',
    fields: [
      {
        Header: 'URL',
        source: 'external_link',
        editConfig: {
          placeholder: 'www.example.com',
        },
      },
    ],
  },
  {
    type: SECTION_FIELD_TYPE,
    title: 'Project',
    description: 'Enter project code below. You may enter multiple codes separated by a comma.',
    fields: [
      {
        Header: 'Project code/s',
        source: 'project_codes',
        column: {
          sortOrder: 1,
          Header: 'Projects',
        },
        Filter: ArrayFilter,
        Cell: ({ value }) => prettyArray(value),
        editConfig: {
          optionsEndpoint: 'projects',
          optionLabelKey: 'code',
          optionValueKey: 'code',
          allowMultipleValues: true,
        },
      },
    ],
  },
];

const EDIT_FIELDS = FIELDS.reduce((result, item) => {
  if (item.type === SECTION_FIELD_TYPE) {
    return [
      ...result,
      {
        ...item,
        fields: item.fields.map(field => ({
          ...field,
          editConfig: {
            ...(field.editConfig || {}),
            editable: field.updateDisabled !== true,
          },
        })),
      },
    ];
  }
  return [
    ...result,
    {
      ...item,
      editConfig: {
        ...(item.editConfig || {}),
        editable: item.updateDisabled !== true,
      },
    },
  ];
}, []);

// Only show fields that are marked as columns, plus the edit and delete buttons
const COLUMNS = [
  ...FIELDS.reduce((result, item) => {
    const fields = item.fields || [item];
    return [
      ...result,
      ...fields
        .filter(field => field.column)
        .map(field => ({
          ...field,
          Header: field.column.Header || field.Header,
        })),
    ];
  }, []).sort((a, b) => a.column.sortOrder - b.column.sortOrder),
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Landing page',
      editEndpoint: LANDING_PAGES_ENDPOINT,
      fields: EDIT_FIELDS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: LANDING_PAGES_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    title: 'New landing page',
    editEndpoint: LANDING_PAGES_ENDPOINT,
    fields: FIELDS,
  },
};

export const CustomLandingPagesPage = ({ getHeaderEl }) => {
  return (
    <ResourcePage
      title="Landing Pages"
      endpoint={LANDING_PAGES_ENDPOINT}
      columns={COLUMNS}
      getHeaderEl={getHeaderEl}
      createConfig={CREATE_CONFIG}
    />
  );
};

CustomLandingPagesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
