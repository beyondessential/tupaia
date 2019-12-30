/**
 * Used in dataBuilderConfig to describe data sources
 *
 * @typedef {Object} DataSource
 * @property {string[]} codes
 * @property {string} type
 *
 * Example:
 * ```js
 * {
 *   codes: ['ELEMENT_CODE_1', 'ELEMENT_CODE_2'],
 *   type: 'single'
 * }
 * ```
 */

/**
 * @typedef {(string|{ operator: string, value: any })} DataValueCondition
 *
 * Example:
 * ```js
 * {
 *   STR_CRF01: { operator: 'regex', value: 'Positive' }
 * }
 * ```
 */

/**
 * @typedef {Object} DataSourceDescriptor
 * @property {DataSource} dataSource
 */

/**
 * @typedef {Object} Conditions
 * @property {Object<string, DataValueCondition>} dataValues
 */

/**
 * @typedef {{ numerator: DataSourceDescriptor, denominator: DataSourceDescriptor }} ValuePercentage
 */

/**
 * @typedef {{ numerator: Conditions, denominator: Conditions }} EventPercentage
 */

/**
 * @typedef {{ dataBuilder: string, dataBuilderConfig: any }} DataBuilder
 *
 * Example:
 * ```
 * {
 *   dataBuilder: 'countEvents',
 *   dataBuilderConfig: {
 *     dataValues: { STR_CRF169: { operator: 'regex', value: 'Positive' } },
 *   },
 * }
 * ```
 */

/**
 * @typedef {Object} ValueOutput
 * @property {string} name
 * @property {number} [timestamp]
 * @property {string|number} [value]
 * @property {number} [total]
 * @property {number} [numerator]
 * @property {number} [denominator]
 */

/**
 * @typedef {{ data: ValueOutput[] }} DataValuesOutput
 *
 * Example:
 * ```js
 * {
 *   data: [
 *     { name: 'BCG Infant', value: 3 }
 *     { name: 'BCG Infant', value: 5, total: 10 }
 *     { name: 'Diabetes', Males: 118, Females: 283 }
 *     { name: 'Positive', value: '0.33', numerator: 1, denominator: 3 }
 *   ],
 * }
 * ```
 */

/**
 * @typedef {{ key: string, title: string }} Column
 */

/**
 * @typedef {{ category: string, columns: Column[] }} CategorizedColumns
 */

/**
 * @typedef {Object} TableOutput
 * @property {Array<{ dataElement, categoryId }>} rows
 * @property {(CategorizedColumns[] | Column[])} columns
 * @property {Array<{ key, title }>} [categories]
 *
 * Example:
 * ```js
 * {
 *   "rows": [
 *     {
 *       "dataElement": "Access to free male and female condoms",
 *       "categoryId": "PEHS_CommunicableDiseases",
 *       "gSrMxjnaJ6P": "green"
 *     }
 *   ],
 *   "columns": [
 *     {
 *       "category": "Hospitals",
 *       "columns": [{ "key": "gSrMxjnaJ6P", "title": "Niu'eiki Hospital" }]
 *     }
 *   ],
 *   "categories": [
 *     {
 *       "key": "PEHS_CommunicableDiseases"
 *       "title": "Communicable Diseases",
 *     }
 *   ]
 * }
 * ```
 */
