

/*
 *
 * meditrak-server
 *   depends on
 *     api-client
 *   export types
 *
 * api-client
 *   depends on nothing
 *   src/
 *     TupaiaApiClient
 *       new MeditrakSreverApiClient
 *     MeditrakServerApiClient extends BaseApiConnection
 *
 *
 *
 *
 *
 */








// import EntityConnection from @tupaia/entity-server
// import MeditrakConnection from @tupaia/meditrak-server

export class TupaiaApiClient {


  constructor() {
    // this.entities = new EntityConnection();
  }

}

export class ServerToServerAuth {

  constructor(){
    // this.username = process.env.MICRO;
    // this.password = process.env.MICRO;
  }
  // ...
}



// ### web-config-server
// auth = custom


// ### tamanu
// auth = new ServerToServerAuth(process.env.MICRO..., ...)




// api = new TupaiaApiClient(auth)
// api.entities.getDescendents('heirarchyId')







// TODO: create an entry in api_client table for tamanu, with specific permissions







// TODO:

// we can avoid circular dependancies by having all clients in api-client. They can import type defs,
// e.g. see top of server-boilerplate/EntityApi.
// Rohan had a problem of having to explicitly declare absolute path in type import. May
// work with package.json types property - https://stackoverflow.com/questions/37548066/typescript-typings-in-npm-types-org-packages

