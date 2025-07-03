/**
 * Material UI Icons Extension for Tupaia Map Overlays
 * 
 * This module provides support for using arbitrary Material UI icons in map overlays.
 * Add new Material UI icons here as needed.
 */

import { ElementType } from 'react';

// Import Material UI icons as needed
// Start with commonly requested icons like Pets for animal markers
// Add more imports here when new icons are needed

// For now, we'll create a placeholder structure that can be extended
// When specific icons are needed, they should be imported and added to the mapping

/**
 * Map of Material UI icon names to their components
 * 
 * To add a new icon:
 * 1. Import it: import NewIcon from '@material-ui/icons/NewIcon';
 * 2. Add to mapping: 'NewIcon': NewIcon,
 * 3. Use in configs: "icon": "NewIcon"
 */
export const materialIcons: { [key: string]: ElementType } = {
  // Icons will be added here as needed
  // Example:
  // 'Pets': Pets,
  // 'Home': Home,
  // 'LocalHospital': LocalHospital,
};

/**
 * Get a Material UI icon component by name
 * Returns null if the icon is not found in the mapping
 */
export const getMaterialIcon = (iconName: string): ElementType | null => {
  return materialIcons[iconName] || null;
};

/**
 * Check if a Material UI icon exists in the mapping
 */
export const hasMaterialIcon = (iconName: string): boolean => {
  return iconName in materialIcons;
};

/**
 * Get all available Material UI icon names
 */
export const getAvailableMaterialIcons = (): string[] => {
  return Object.keys(materialIcons);
};

/**
 * Instructions for adding new Material UI icons:
 * 
 * 1. Add the import at the top of this file:
 *    import YourIcon from '@material-ui/icons/YourIcon';
 * 
 * 2. Add to the materialIcons mapping:
 *    'YourIcon': YourIcon,
 * 
 * 3. The icon can now be used in map overlay configurations:
 *    "icon": "YourIcon"
 * 
 * 4. Common icons to consider adding:
 *    - Pets (for animal markers)
 *    - Home (for residential markers)
 *    - LocalHospital (for medical facilities)
 *    - School (for educational institutions)
 *    - Restaurant (for dining locations)
 *    - DirectionsCar (for parking/transport)
 *    - Star (for featured locations)
 *    - LocationOn (for general locations)
 */