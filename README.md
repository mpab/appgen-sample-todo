# User Guide

Quick Start

```sh
./docker/db-recreate-seed
./docker-app-start
```

UI <http://localhost:4200>  
API <http://localhost:3000/api-docs>

## Application Structure

```text
├── backend
│   ├── api             # Business logic and API
│   └── database        # Database layer
├─ database
│  ├── csv_seed         # seed data
│  ├── scripts          # db scripts
│  └── sql              # SQL statements used by the db scripts
├── configure
│   ├── csv             # CSV source data
│   ├── using-csv       # use to generate the application, schema, and seed data
│   └── schema          # JSON data schema
│   └── using-schema    # use to generate the application, and seed data
├── docker              # docker scripts and helpers
├── frontend            # Presentation layer
└── pgdata              # Database mount point, contains the DB data
```

## Scripts and helpers

## Docker

```sh
# checks for docker, then runs any docker command
./docker/-cmd

calls docker compose using the default yaml file
./docker/-compose

# runs a docker command against the api container
# e,g, ./docker/api sh
./docker/api

# CAUTION: removes all docker artifacts
./docker/app-purge

# starts the app
./docker/app-start

# starts the api and db
./docker/app-start-backend

# starts the ui
./docker/app-start-frontend

# stops the app
./docker/app-stop

# stops the api and db
./docker/app-stop-backend

# stops the ui
./docker/app-stop-frontend

# used by ./docker/-compose
compose-vol-service.yaml
compose-vol-shared.yaml

# runs a docker command against the db container
# e.g. ./docker/db sh
./docker/db

# opens the psql tertminal in the db docker
./docker/db-psql

# (re) creates the db tables and seeds the tables with CSV data
./docker/db-recreate-seed

# starts the db container
./docker/db-start

# stops the db container
db-stop

# runs a docker command against the ui container
# e.g. ./docker/ui sh
./docker/ui
```

## Native

```sh
# CAUTION: recursively search and remove node artifacts
app-node-purge

# Starts the db docker container, and runs the api and ui natively
# (requires tmux)
app-start

# Stops the db docker container, and shutdown the api and ui
app-stop
```

## UI Pages

<http://localhost:4200>

## API Endpoints (Swagger/OpenAPI docs)

<http://localhost:3000/api-docs>

---

## Database

```sh
./docker/db-psql
```

```postgres
--- get tables
\dt
-- get sequence tables
\ds
```

### Database Admin (adminer)'

<http://localhost:8080>

- System PostgresSQL
- Server database
- Username postgres
- Password password
- Database postgres

## Generated via the following templates

- frontend: ng-20.0.3-mui
- backend:  express-js-postgres
