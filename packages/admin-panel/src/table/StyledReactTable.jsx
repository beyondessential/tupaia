/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import ReactTable from 'react-table-v6';
import * as COLORS from '../theme/colors';

export const StyledReactTable = styled(ReactTable)`
  margin-block: 2.5rem;
  border: none;

  .rt-tbody .rt-tr .rt-td,
  .rt-thead.-header .rt-th,
  .rt-thead.-filters .rt-th {
    border-right: none;
  }

  // Header
  .rt-thead.-header {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background: white;
    border: 1px solid ${COLORS.GREY_DE};
    box-shadow: none;

    .rt-th {
      font-weight: 500;
      font-size: 1rem;
      color: ${COLORS.TEXT_DARKGREY};
      text-align: left;
      padding-block: 0.375rem;
      padding-inline: 0.32rem;
    }
  }

  // Filters
  .rt-thead.-filters {
    background: #f1f1f1;
    border-bottom: 1px solid ${COLORS.GREY_DE};
    border-left: 1px solid ${COLORS.GREY_DE};
    border-right: 1px solid ${COLORS.GREY_DE};

    .rt-th {
      text-align: left;
      padding-top: 1rem;
      padding-bottom: 1rem;

      .MuiFormControl-root {
        margin-bottom: 0;
      }

      .MuiInputBase-input {
        height: auto;
        border: none;
        font-size: 1rem;
        line-height: 1.2rem;
        padding: 1rem;
      }
    }
  }

  // Body
  .rt-tbody {
    background: white;
    border-left: 1px solid ${COLORS.GREY_DE};
    border-right: 1px solid ${COLORS.GREY_DE};
    border-bottom: 1px solid ${COLORS.GREY_DE};
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  // Row
  .rt-tbody .rt-tr-group {
    border-bottom: 1px solid ${COLORS.GREY_DE};
  }

  .rt-tr {
    padding-inline-start: 0.625rem;
    padding-inline-end: 1.56rem;
    align-items: center;

    .rt-td {
      font-size: 1rem;
      color: ${COLORS.TEXT_MIDGREY};
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .rt-expandable {
      position: relative;
      top: 2px;
    }
  }

  // Pagination
  .-pagination {
    box-shadow: none;
    border: none;
    padding: 1.25rem 0 0;
    align-items: center;

    .MuiButtonBase-root:not(:hover) {
      background: ${COLORS.GREY_F1};
    }

    .-previous {
      order: 2;
      flex: 0;
      margin-left: 10px;
    }

    .-next {
      order: 3;
      flex: 0;
      margin-left: 10px;
    }

    .-center {
      order: 1;
      flex-direction: row-reverse;
      justify-content: space-between;

      .-pageInfo {
        font-size: 14px;
        line-height: 16px;
        color: ${COLORS.TEXT_MIDGREY};
      }

      input {
        color: ${COLORS.TEXT_DARKGREY};
      }

      .-pageSizeOptions {
        margin: 0;
        text-align: left;

        .MuiInputBase-root {
          background: ${COLORS.GREY_F1};
          font-weight: 500;
        }

        .MuiSelect-root {
          font-size: 14px;
          line-height: 16px;
          color: ${COLORS.TEXT_MIDGREY};
          padding: 12px 44px 12px 15px;
        }

        .MuiOutlinedInput-notchedOutline {
          border: none;
        }

        .MuiFormControl-root {
          margin: 0;
        }
      }
    }
  }
`;
