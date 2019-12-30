# Tupaia Devops
The place where Tupaia devs go to op

## Setting up the server
See instructions at `Set up server.md`

## Server structure overview

### Repositories
All repositories are stored in the ubuntu user's home directory, i.e. `/home/ubuntu/` or just `~`

Server repositories (with postgres database, running on pm2)
- meditrak-server
- tupaia-config-server

Front end repositories (built as static sites, nginx directly serves static files)
- tupaia-web
- tupaia-admin

Other repositories
- tupaia-devops (this)

### Connecting things together, and changing where they point for local development
The different servers and front ends talk to specific instances of each other based on the environment variables in
their .env files. If you want to change which components are talking to which, you just have to change the
relevant .env entry, and rebuild (just reloading is not enough).

Here's where things point on the live setup, and examples of what to change them to. Note that you should just use
the dev- version to make it easy, unless you are actually making a change to that project, at which point you should
use localhost:
- meditrak-server
  - Postgres Database
    - Dev: DB_URL="dev-api.tupaia.org"
    - Local: DB_URL="localhost" (Set up postgres db matching instructions in Set up server.md)
  - DHIS2
    - Dev: DHIS_URL="https://dev-aggregation.tupaia.org"
    - Local: DHIS_URL="http://localhost:8888" (Run using docker according to `docker-dhis` repo)
- tupaia-config-server
  - Postgres Database
    - Always expected to be on localhost, can't change.
    - For local development, run `./pgSql/pg-start.sh -r` and if make sure the .env has:
      ```
      POSTGRES_DB_NAME="config"
      POSTGRES_PASSWORD="pass"
      POSTGRES_PORT="5433"
      POSTGRES_USERNAME="postgres"
      ```
  - Auth Server (meditrak-server)
    - Dev: TUPAIA_APP_SERVER_URL="https://dev-api.tupaia.org/v2"
    - Local: TUPAIA_APP_SERVER_URL="http://localhost:8090/v2" (`yarn start-dev` in `meditrak-server`)
  - Export Frontend for PNG and PDF exports (tupaia-web built for export)
    - Dev: EXPORT_URL="https://dev-export.tupaia.org"
    - Local: "http://localhost:3001" (`yarn start-exporter` in `tupaia-web`)
  - Export cookie url for PNG and PDF exports (tupaia-config-server)
    - Dev: EXPORT_COOKIE_URL="dev-config.tupaia.org"
    - Local: EXPORT_COOKIE_URL="localhost:8080" (`yarn start-dev` in `tupaia-config-server`)
  - Export data server for Excel chart raw data exports (tupaia-config-server)
    - Dev: CONFIG_SERVER_BASE_URL="https://dev-config.tupaia.org/api/v1"
    - Local: CONFIG_SERVER_BASE_URL="http://localhost:8080/api/v1" (`yarn start-dev` in `tupaia-config-server`)
- tupaia-web
  - Config server (tupaia-config-server)
    - Dev: REACT_APP_CONFIG_SERVER_BASE_URL="https://dev-config.tupaia.org/api/v1/"
    - Local: REACT_APP_CONFIG_SERVER_BASE_URL="http://localhost:8080/api/v1/" (`yarn start-dev` in `tupaia-config-server`)
- tupaia-admin
  - Auth and data server (meditrak-server)
    - Dev: REACT_APP_API_URL="https://dev-api.tupaia.org/v2"
    - Local: REACT_APP_API_URL="http://localhost:8090/v2" (`yarn start-dev` in `meditrak-server`)
- meditrak
  - Auth and data server (meditrak-server)
    - Dev: BASE_URL="https://dev-api.tupaia.org/v2"
    - Local: BASE_URL="http://[your ip on lan]:8090/v2" (`yarn start-dev` in `meditrak-server`)

N.B. Ports listed are the current defaults, if you are experiencing issues, first investigate which port
each is running on locally. A summary of defaults:
- meditrak-server: 8090
- meditrak-server postgres: 5432
- tupaia-config-server: 8000
- tupaia-config-server postgres: 5433
- tupaia-web: 8088
- tupaia-web mobile: 8089
- tupaia-web exporter: 3001
- tupaia-admin: 3000

### Nginx
Nginx is the web server/reverse proxy that all urls hit first, before being directed to their appropriate
port on the machine. The config file should be kept up to date in this repository at `./configs/servers.conf`,
and if any changes are made running the full deploy script (see below) or just `./scripts/deployment/configureNginx.sh`
will copy them over to `/etc/nginx/conf.d/servers.conf` and restart nginx

### Postgres
PostgreSQL should be running on the machine, acting as the database for meditrak-server (db name `tupaia`) and
tupaia-config-server (db name `tupaia-config-server`). Again, setup instructions are in `Set up server.md`

### PM2
Server repositories are run using pm2 to ensure that if any exceptions cause node to crash, they will be
restarted. However, we don't use `autostart`, so pm2 won't restart automatically on boot, as that should
happen through the startup deploy script being run (see below)

Some handy commands:
- `pm2 list` - See processes running
- `pm2 logs` - Tail the logs being spat out by all processes
- `pm2 dash` - Tail logs with info about cpu, memory usage etc.
- `pm2 restart meditrak-server` - Restart the `meditrak-server` process after changing something

## Deploying
The script `./scripts/deployment/startup.sh` will run on reboot (or you can run it manually) to fetch and
deploy the latest version of each repository on this server, based on the `Stage` tag of the ec2 instance,
including getting the appropriate environment variables (see Environment variables section below).

If the stage tag is `production`, the `master` branch will be fetched and deployed to the production urls.
Otherwise, the branch with the same name as the tag will be fetched and deployed to urls with the stage
tag appended in front, e.g. if the instance is tagged `dev` then the `dev` branch will be fetche, and deployed
to `dev-admin.tupaia.org` etc.

## Environment variables

During the deploy process, environment variables will be fetched from AWS SSM parameter store based
on the path of the repository and stage, i.e. for the stage tag `production` and repository `meditrak-server`,
all environment variables saved in parameter store as `/meditrak-server/production/ENVIRONMENT_VARIABLE_NAME`
will be fetched and injected into the .env file of meditrak-server before it is deployed.

Note that the ec2 instance will need to have a role granting it access to the parameter store, and environment
variables should be added into the parameter store as secure strings, encrypted with an encryption key
which is made accessible to the same role.

For more info read https://blog.rackspace.com/securing-application-secrets-with-ec2-parameter-store

To quickly send all environment variables in the .env file of a given repository to parameter store (such
as after you've made a change to the .env file and want to sync that with parameter store), run e.g. `./scripts/utility/storeDotEnvOnParameterStore.sh --repository-name meditrak-server --environment dev`
from an ec2 instance with a role that can access parameter store and the encryption key

## Case Study: Setting up beta.tupaia.org

To set up a beta server based on the production server
- In the AWS web interface, start a new ec2 instance by choosing "Launch more like this" on the Tupaia Production instance
- Change its security group to Tupaia Development SG or similar
- Change the tags to have RestoreFrom=tupaia, Name=Tupaia Beta Server, Backup=Tupaia Beta Server, Stage=beta
- Assign it an Elastic IP, and set up the following urls to point to that IP on crazydomains.com.au
  - beta.tupaia.org
  - beta-admin.tupaia.org
  - beta-api.tupaia.org
  - beta-config.tupaia.org
  - beta-export.tupaia.org
  - beta-mobile.tupaia.org
- ssh into the dev server, and run the following to set up the environment variables for the beta server on parameter store
  - `~/tupaia-devops/scripts/utility/storeDotEnvOnParameterStore.sh --repository-name meditrak-server --environment beta`
  - `~/tupaia-devops/scripts/utility/storeDotEnvOnParameterStore.sh --repository-name tupaia-config-server --environment beta`
  - `~/tupaia-devops/scripts/utility/storeDotEnvOnParameterStore.sh --repository-name tupaia-web --environment beta`
  - `~/tupaia-devops/scripts/utility/storeDotEnvOnParameterStore.sh --repository-name tupaia-admin --environment beta`
- Log in to AWS SSM Parameter Store web interface and change the following secret parameters:
  - `/tupaia-config-server/beta/CONFIG_SERVER_BASE_URL/` to https://beta-config.tupaia.org
  - `/tupaia-config-server/beta/TUPAIA_APP_SERVER_URL/` to https://beta-api.tupaia.org/v2
  - `/tupaia-config-server/beta/EXPORT_URL/` to https://beta-export.tupaia.org
  - `/tupaia-config-server/beta/EXPORT_COOKIE_URL/` to beta-config.tupaia.org
  - `/tupaia-web/beta/REACT_APP_CONFIG_SERVER_BASE_URL` to https://beta-config.tupaia.org/api/v1/
  - `/tupaia-admin/beta/REACT_APP_API_URL` to https://beta-api.tupaia.org/v2
- Set up a branch called `beta` in each of the four repositories
- Run the lambda script 'backupEC2'
- Wait until the snapshot has finished creating (can check progress in ec2 web interface), then run 'restoreFromBackup' (note that this will have the side effect of also re-cloning all other dev servers)
- The deployment scripts should run, so that when the ec2 server starts back up, it should all be working
Note that we left both tupaia-config-server and meditrak-server pointing to https://dev-aggregation.tupaia.org as their DHIS2 server. If we want a full beta setup, we also need to follow a similar process to get a clone of the aggregation server.


