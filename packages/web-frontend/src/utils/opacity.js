/**
 *
 * @param {number} numberOfLayers
 * @param {number} index
 * @param {boolean = false} ascending
 * @returns {number} opacity value
 */
export const getLayeredOpacity = (numberOfLayers, index, ascending = false) => {
  return ascending ? (index + 1) / numberOfLayers : 1 - index / numberOfLayers;
};
