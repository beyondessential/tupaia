import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@material-ui/core';
import { SECTION_FIELD_TYPE } from '../../editor/constants';
import { ResourcePage } from './ResourcePage';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const LANDING_PAGES_ENDPOINT = 'landingPages';

// the URL prefix to display in the url_segment field
const URL_PREFIX = `https://${process.env.NODE_ENV === 'production' ? 'www' : 'dev'}.tupaia.org`;

const DISPLAY_URL_PREFIX = `${URL_PREFIX.replace('https://', '')}/`;

// All the fields of a custom landing page
const FIELDS = {
  NAME: {
    Header: 'Name',
    source: 'name',
  },
  NAME_HEADER: {
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
  URL_SEGMENT: {
    Header: 'Custom link',
    source: 'url_segment',
    // format the value to include the URL prefix in the table, and display as a clickable link
    // eslint-disable-next-line react/prop-types
    Cell: ({ value }) => (
      <Link href={`${URL_PREFIX}/${value}`} target="_blank">{`${DISPLAY_URL_PREFIX}${value}`}</Link>
    ),
    editConfig: {
      // the prefix to display in the field
      startAdornment: DISPLAY_URL_PREFIX,
    },
  },
  IMAGE: {
    Header: 'Main image',
    source: 'image_url',
    editConfig: {
      type: 'image',
      avatarVariant: 'square',
      deleteModal: {
        title: 'Remove landing page image',
        message: 'Are you sure you want to delete your image?',
      },
      minWidth: 1500,
      minHeight: 900,
      maxHeight: 2000,
      maxWidth: 2000,
    },
  },
  LOGO: {
    Header: 'Logo image',
    source: 'logo_url',
    editConfig: {
      type: 'image',
      avatarVariant: 'square',
      deleteModal: {
        title: 'Remove logo image',
        message: 'Are you sure you want to delete your image?',
      },
      maxHeight: 300,
      maxWidth: 300,
    },
  },
  PRIMARY_COLOR: {
    Header: 'Primary colour hex code',
    source: 'primary_hexcode',
    editConfig: {
      type: 'hexcode',
      placeholder: '#000000',
    },
  },
  SECONDARY_COLOR: {
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
  EXTENDED_TITLE: {
    Header: 'Extended title (max 60 characters)',
    source: 'extended_title',
    editConfig: {
      maxLength: 60,
      type: 'text',
      placeholder: 'A short sentence about your project',
      labelTooltip: 'This will only be shown on single project landing pages',
    },
  },
  LONG_BIO: {
    Header: 'Long bio (max 250 characters)',
    source: 'long_bio',
    editConfig: {
      maxLength: 250,
      type: 'textarea',
      placeholder: 'A longer bio about your project',
    },
  },
  PHONE_NUMBER: {
    Header: 'Phone',
    source: 'phone_number',
    editConfig: {
      placeholder: '+123456789',
    },
  },
  WEBSITE_URL: {
    Header: 'Website',
    source: 'website_url',
    editConfig: {
      placeholder: 'www.example.com',
    },
  },
  EXTERNAL_LINK: {
    Header: 'URL',
    source: 'external_link',
    editConfig: {
      placeholder: 'www.example.com',
    },
  },
  PROJECTS: {
    Header: 'Project code/s',
    source: 'project_codes',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  },
};

// All the sections
const SECTIONS = {
  DETAILS: {
    type: SECTION_FIELD_TYPE,
    fields: [FIELDS.NAME, FIELDS.NAME_HEADER, FIELDS.URL_SEGMENT],
  },
  MAIN_IMAGE: {
    type: SECTION_FIELD_TYPE,
    title: 'Add main image',
    description: '(Width:1500-2000px and height:900-2000px)',
    fields: [FIELDS.IMAGE],
  },
  LOGO: {
    type: SECTION_FIELD_TYPE,
    title: 'Add logo image',
    description: '(Max 300px x 300px)',
    fields: [FIELDS.LOGO],
  },
  PRIMARY_COLOR: {
    type: SECTION_FIELD_TYPE,
    title: 'Primary colour',
    description:
      'This colour will be used for the header bar and other details. If no colour is specified a default colour will be applied.',
    fields: [FIELDS.PRIMARY_COLOR],
  },
  SECONDARY_COLOR: {
    title: 'Secondary colour',
    description:
      'This colour will be used for text and other accents that appear in the header bar. Please select the option that provides most contrast to your primary colour. If no colour is specified a default colour will be applied.',
    type: SECTION_FIELD_TYPE,
    fields: [FIELDS.SECONDARY_COLOR],
  },
  EXTENDED_DETAILS: {
    type: SECTION_FIELD_TYPE,
    fields: [FIELDS.EXTENDED_TITLE, FIELDS.LONG_BIO],
  },
  CONTACT_DETAILS: {
    type: SECTION_FIELD_TYPE,
    title: 'Contact information',
    description: 'Add contact information you would like to show on the landing page.',
    fields: [FIELDS.PHONE_NUMBER, FIELDS.WEBSITE_URL],
  },
  EXTERNAL_LINK: {
    type: SECTION_FIELD_TYPE,
    title: 'External link',
    description: 'Add an external link where users can learn more about your project',
    fields: [FIELDS.EXTERNAL_LINK],
  },
  PROJECTS: {
    type: SECTION_FIELD_TYPE,
    title: 'Project',
    description: 'Enter project code below. You may enter multiple codes separated by a comma.',
    fields: [FIELDS.PROJECTS],
  },
};

// Fields for creating a landing page
const CREATE_FIELDS = [
  SECTIONS.DETAILS,
  SECTIONS.MAIN_IMAGE,
  SECTIONS.LOGO,
  SECTIONS.PRIMARY_COLOR,
  SECTIONS.SECONDARY_COLOR,
  SECTIONS.EXTENDED_DETAILS,
  SECTIONS.CONTACT_DETAILS,
  SECTIONS.EXTERNAL_LINK,
  SECTIONS.PROJECTS,
];

// Fields for editing a landing page
const EDIT_FIELDS = [
  {
    ...SECTIONS.DETAILS,
    fields: [
      FIELDS.NAME,
      FIELDS.NAME_HEADER,
      {
        ...FIELDS.URL_SEGMENT,
        editable: false,
      },
    ],
  },
  SECTIONS.MAIN_IMAGE,
  SECTIONS.LOGO,
  SECTIONS.PRIMARY_COLOR,
  SECTIONS.SECONDARY_COLOR,
  SECTIONS.EXTENDED_DETAILS,
  SECTIONS.CONTACT_DETAILS,
  SECTIONS.EXTERNAL_LINK,
  SECTIONS.PROJECTS,
];

// Table columns
const COLUMNS = [
  FIELDS.NAME,
  {
    ...FIELDS.PROJECTS,
    Header: 'Projects',
  },
  {
    ...FIELDS.URL_SEGMENT,
    Header: 'URL',
  },
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
    title: 'New Landing Page',
    editEndpoint: LANDING_PAGES_ENDPOINT,
    fields: CREATE_FIELDS,
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
