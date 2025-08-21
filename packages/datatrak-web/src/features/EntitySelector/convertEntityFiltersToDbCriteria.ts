import { EntityFilter } from '@tupaia/types';

/**
 * Converts the output of useEntityBaseFilters to database criteria format
 * that can be used with EntityModel queries
 */
export const convertEntityFiltersToDbCriteria = (
  baseFilters: Record<string, string | string[]>
): EntityFilter => {
  const criteria: Record<string, any> = {};

  Object.entries(baseFilters).forEach(([key, value]) => {
    // Skip undefined or null values
    if (value === undefined || value === null) {
      return;
    }

    // Handle different filter keys
    switch (key) {
      case 'countryCode':
        // Map countryCode to country_code field in database
        criteria.country_code = value;
        break;
      
      case 'type':
        // Handle type filter - can be string or comma-separated string that needs to be converted to array
        if (typeof value === 'string' && value.includes(',')) {
          // Convert comma-separated string to array for IN query
          const typeArray = value.split(',').map(t => t.trim()).filter(Boolean);
          criteria.type = typeArray.length > 1 ? typeArray : typeArray[0];
        } else {
          criteria.type = value;
        }
        break;
        
      case 'parentId':
        // Handle parent entity filter
        criteria.parent_id = value;
        break;
        
      case 'grandparentId':
        // Handle grandparent entity filter - this might need special handling
        // depending on how the database model supports grandparent queries
        criteria.grandparent_id = value;
        break;
        
      default:
        // Handle attributes filters and any other direct field mappings
        if (key.startsWith('attributes->>')) {
          // JSONB attribute queries - pass through as-is since the database
          // model understands this syntax
          criteria[key] = value;
        } else {
          // For any other fields, pass through directly
          criteria[key] = value;
        }
        break;
    }
  });

  return criteria as EntityFilter;
};

/**
 * Type-safe wrapper that takes the exact output type from useEntityBaseFilters
 */
export const convertBaseFiltersToDbCriteria = (
  filters: ReturnType<typeof import('./useEntityBaseFilters').useEntityBaseFilters>
): EntityFilter => {
  return convertEntityFiltersToDbCriteria(filters);
};

/**
 * Example usage:
 * 
 * const baseFilters = useEntityBaseFilters(config, answers, countryCode);
 * const dbCriteria = convertBaseFiltersToDbCriteria(baseFilters);
 * 
 * // Use with EntityModel
 * const entities = await models.entity.find(dbCriteria);
 * 
 * // Example input:
 * // {
 * //   countryCode: 'TO',
 * //   type: 'facility,hospital',
 * //   parentId: 'some-parent-id',
 * //   'attributes->>type': 'gym'
 * // }
 * 
 * // Example output:
 * // {
 * //   country_code: 'TO',
 * //   type: ['facility', 'hospital'],
 * //   parent_id: 'some-parent-id',
 * //   'attributes->>type': 'gym'
 * // }
 */
