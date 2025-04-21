import { SECTION_FIELD_TYPE } from '../editor/constants';

// This function is used to explode fields that are nested in sections
export const getExplodedFields = items => {
  return items.reduce((result, item) => {
    if (item.type === SECTION_FIELD_TYPE) {
      result.concat(item.fields);
    } else {
      result.push(item);
    }
    return result;
  }, []);
};
