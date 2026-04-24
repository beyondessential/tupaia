/**
 * @typedef {import('../BaseDatabase').JoinType} JoinType
 * @typedef {{
 *   joinWith: string;
 *   joinAs?: string;
 *   joinType?: JoinType;
 *   joinCondition: [string, string];
 *   fields?: Record<string, string | undefined>;
 * }} MultiJoinItem
 */

/**
 * @template {readonly MultiJoinItem[]} Base
 * @param {readonly Base} base
 * @param {readonly MultiJoinItem[]} source
 * @returns {[...Base, ...MultiJoinItem[]]}
 */
export function mergeMultiJoin(base, source) {
  if (!source || source.length === 0) return base;

  const existingJoinTables = new Set(base.map(j => j.joinWith));
  const uniques = source.filter(j => !existingJoinTables.has(j.joinWith));

  return [...base, ...uniques];
}
