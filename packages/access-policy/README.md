# Tupaia Access Policy

Methods for parsing the access policy that is received by Tupaia projects during authentication.

## Examples

```
// Create access policy instance
const accessPolicy = new AccessPolicy(policy); // where `policy` is a JSON string to parse

// Returns whether or not the access policy grants access to the 'Donor' permissionGroup for the
// DL_North area, or its ancestor DL
accessPolicy.allowsSome(['DL', 'DL_North'], 'Donor');

// Returns whether or not the access policy grants any access to Demo Land
accessPolicy.allows('DL');
```

## JSON Structure

```
{
  "EntityCode": ["PermissionGroupName", "PermissionGroupName"],
  "EntityCode": ["PermissionGroupName"]
};
```

## Location-Permission connection

User can have permission entries for any entity. It is up to the client to determine how these cascade
down the entity hierarchy, by passing in the list of ancestors of the requested entity when access is
being checked using `allowsSome`.

E.g. if you are checking whether a user has access to the facility 'Thornbury', you should first
build a list of its ancestors, i.e. Ravenclaw (subdistrict), South West (district), and Demo Land
(country), and pass all of these codes through to `allowsSome`. In that way, if the user has access
to any entity further up the hierarchy, they will be granted access to Thornbury.

## Running tests

yarn test               # Runs all tests
yarn test:coverage      # Runs tests and displays project test coverage
 	 
## Editing, changing, building

Edit files in src and run `npm run build` to create a new version that's able to be imported by other
projects. Commit files from the dist files along with source files.
