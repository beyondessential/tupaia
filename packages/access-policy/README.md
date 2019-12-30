# Tupaia Access Policy
Methods for parsing the access policy that is received by Tupaia projects during authentication.

## hasAccess
Helper for determining whether a particular resource is accessible as defined by the access policy.

### Examples
```
// Returns whether or not the access policy grants access to DL_North area within DL for surveys at a Donor level.
hasAccess(accessPolicy, 'surveys', ['DL', 'DL_North'], 'Donor');

// Returns whether or not the access policy grants access to Reports for DL at any level.
hasAccess(accessPolicy, 'reports', ['DL']);
```

### JSON Structure
```
{
    "permissions": {
      "surveys": {
        "_items": {
          "Country": {
            "_access": {
              "Permission Group": bool
            },
            "_items": {
              "Region": {
                "_access": {
				  "Permission Group": bool
                },
                "Region": {
                  "_access": {
				    "Permission Group": bool
                  }
                },
                "_items": {
                  "Facility": {
                    "_access": {
				  	  "Permission Group": bool
	                },
                  }
				}
              }
            }
          }
        }
      },
      "reports": {
        "_items": {
          "Country": {
            "_access": {
              "Permission Group": bool
            },
            "_items": {
              "Region": {
                "_access": {
				  "Permission Group": bool
                },
                "Region": {
                  "_access": {
				    "Permission Group": bool
                  }
                },
                "_items": {
                  "Facility": {
                    "_access": {
				  	  "Permission Group": bool
	                },
                  }
				}
              }
            }
          }
        }
      }
    }
  };
```

## Location-Permission connection
User can have permission entries for countries, regions, sub-regions and facilities. If a user has the Admin permission group for a country, they will have Admin permissions for all children of that country. A child can override a parent permission, which will also override the permission for it's own children.

### Running tests
Use the command `npm run test`.

## Editing, changing, building
Edit files in src and run `npm run build` to create a new version that's able to be imported by other projects. Commit files from the dist files along with source files.