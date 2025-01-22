import cheerio from 'cheerio';
import { html as beautifyHtml } from 'js-beautify';

const HTML_ATTRS_TO_STRIP_FROM_SNAPSHOTS = ['clip-path', 'id', 'data-reactid', 'data-testid'];

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export const escapeRegex = string => {
  // $& means the whole matched string
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};

const stripHtmlAttributes = (html, attrs) => {
  const $ = cheerio.load(html);
  attrs.forEach(attr => {
    $('*').removeAttr(attr);
  });

  return $('body').html();
};

/**
 * Taken from @cypress/snapshot
 *
 * @see https://github.com/cypress-io/snapshot/blob/master/src/utils.js
 */
export const serializeReactToHTML = jQueryEl => {
  const html = jQueryEl[0].outerHTML;
  const sanitizedHtml = stripHtmlAttributes(html, HTML_ATTRS_TO_STRIP_FROM_SNAPSHOTS);
  const options = {
    wrap_line_length: 80,
    indent_inner_html: true,
    indent_size: 2,
    wrap_attributes: 'force',
  };

  return beautifyHtml(sanitizedHtml, options);
};

export const requireCyEnv = variable => {
  const unprefixedVariable = variable.replace(/^CYPRESS_/, '');
  const value = Cypress.env(unprefixedVariable);
  if (value === undefined) {
    throw new Error(`Could not load Cypress env variable 'CYPRESS_${unprefixedVariable}'`);
  }
  return value;
};
