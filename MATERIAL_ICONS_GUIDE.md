# Material UI Icons in Tupaia Map Overlays

## Overview

Tupaia now supports using any Material UI icon in map overlays, in addition to the predefined icon set. This allows for much more flexible and expressive map markers.

## Using Material UI Icons

### In Map Overlay Configuration

You can now specify any Material UI icon name in your map overlay configuration:

```json
{
  "displayType": "icon",
  "icon": "Pets",
  "measureConfig": {
    "dog": {
      "icon": "Pets",
      "color": "brown",
      "name": "Dog Location"
    },
    "cat": {
      "icon": "Pets", 
      "color": "gray",
      "name": "Cat Location"
    },
    "hospital": {
      "icon": "LocalHospital",
      "color": "red",
      "name": "Hospital"
    },
    "school": {
      "icon": "School",
      "color": "blue", 
      "name": "School"
    }
  }
}
```

### Supported Icon Types

1. **Predefined Icons**: Continue to use the existing IconKey enum values
   - `IconKey.PIN`, `IconKey.CIRCLE`, `IconKey.WARNING`, etc.

2. **Material UI Icons**: Use any Material UI icon name as a string
   - `"Pets"` for animal markers
   - `"Home"` for residential markers  
   - `"LocalHospital"` for medical facilities
   - `"School"` for educational institutions
   - `"Restaurant"` for dining locations
   - And many more...

## Adding New Material UI Icons

To add support for new Material UI icons:

### 1. Add the Import

In `packages/ui-map-components/src/components/Markers/markerIcons.tsx`:

```typescript
// Add your new icon import with the existing Material UI imports
import YourNewIcon from '@material-ui/icons/YourNewIcon';
```

### 2. Add to the Material Icons Map

Add the icon to the `materialIcons` object:

```typescript
const materialIcons: { [key: string]: ElementType } = {
  // ... existing icons
  'YourNewIcon': YourNewIcon,
};
```

### 3. Use in Configuration

Now you can use the icon name in your map overlay configurations:

```json
{
  "icon": "YourNewIcon"
}
```

## Available Material UI Icons

Some commonly useful icons for map overlays:

### Animals & Pets
- `Pets` - General pets/animals

### Buildings & Places
- `Home` - Residential buildings
- `Business` - Commercial buildings  
- `School` - Educational institutions
- `LocalHospital` - Medical facilities
- `Restaurant` - Dining establishments
- `Hotel` - Accommodation
- `Store` - Retail locations

### Transportation
- `DirectionsCar` - Parking or car-related
- `Train` - Railway stations
- `Flight` - Airports
- `DirectionsBus` - Bus stops

### Utilities & Services
- `Phone` - Communication services
- `Email` - Contact points
- `Event` - Event locations
- `Work` - Office buildings

For a complete list of available Material UI icons, visit:
https://material-ui.com/components/material-icons/

## Fallback Behavior

If a specified icon is not found:
1. The system will log a warning to the console
2. Fall back to the default icon (health pin)
3. The map will continue to function normally

## Type Safety

The type system supports both predefined icons and arbitrary strings:

```typescript
// Both of these are valid:
const predefinedIcon: IconKeyOrString = IconKey.PIN;
const materialIcon: IconKeyOrString = "Pets";
```

## Migration Guide

Existing map overlays using predefined icons will continue to work without changes. To use new Material UI icons:

1. Identify the Material UI icon you want to use
2. Add the import and mapping (if not already present)  
3. Update your map overlay configuration to use the icon name string
4. Test that the icon displays correctly

## Performance Considerations

- Icons are statically imported and cached for optimal performance
- No dynamic imports that could cause loading delays
- Bundle size impact is minimal as only used icons are included

## Troubleshooting

### Icon Not Displaying
1. Check that the icon name matches exactly (case-sensitive)
2. Verify the icon is imported and mapped in `markerIcons.tsx`
3. Check the browser console for warning messages
4. Ensure the Material UI icons package is installed

### TypeScript Errors
1. Make sure you're using `IconKeyOrString` type instead of just `IconKey`
2. Update type imports if needed: `import { IconKeyOrString } from '@tupaia/types'`