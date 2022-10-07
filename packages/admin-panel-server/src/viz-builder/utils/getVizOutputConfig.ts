/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { PreviewMode } from '../types';

export const getVizOutputConfig = (
  previewMode: PreviewMode,
  presentation: Record<string, unknown>,
) => {
  switch (previewMode) {
    case PreviewMode.PRESENTATION: {
      // Use whatever is configured in the viz's output config in the presentation options
      return presentation?.output;
    }
    case PreviewMode.DATA: {
      // Use rowsAndColumns output to render the viz-builder data-table with correct columns order
      return { type: 'rowsAndColumns' };
    }
    default: {
      throw new Error(`Unknown preview mode ${previewMode}`);
    }
  }
};
