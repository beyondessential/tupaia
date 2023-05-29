## @tupaia/auth

Back-end authentication

Used internally by web-config-server and central-server to authenticate a user's credentials against
the database, and build their access policy.

An access policy is a representation of the users permissions, listing out each entity they have
permission for, and what permission groups they have for that entity (explicitly including any
permission groups that are implied by association with a higher level permission group).

E.g. a user with "Donor" access in Demo Land, and "Public" access in Tonga would have the access
policy

```
{
  "DL": ["Donor", "Public"], // Donor is the parent of Public, so Public is also included in the built policy
  "TO": ["Public"]
}
```

Note that parsing of that access policy is handled by the separate isomorphic package
@tupaia/access-policy, as it is required on both the back ends and front end clients (admin-panel,
meditrak-app, etc.)
