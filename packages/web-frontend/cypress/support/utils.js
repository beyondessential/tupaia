/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { html as beautifyHtml } from 'js-beautify';

export const equalStringsI = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) === 0;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export const escapeRegex = string => {
  // $& means the whole matched string
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};

const stripReactIdAttributes = html => html.replace(/data-reactid="[.\d$\-abcdfef]+"/g, '');

/**
 * Taken from @cypress/snapshot
 *
 * @see https://github.com/cypress-io/snapshot/blob/master/src/utils.js
 */
export const serializeReactToHTML = jQueryEl => {
  const html = jQueryEl[0].outerHTML;
  const stripped = stripReactIdAttributes(html);
  const options = {
    wrap_line_length: 80,
    indent_inner_html: true,
    indent_size: 2,
    wrap_attributes: 'force',
  };

  return beautifyHtml(stripped, options);
};
