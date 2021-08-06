# weather-vortex-server

Server for Weather Vortex Project.

** Table of contents **

- [How to](#how-to)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)
- [Structure](#structure)

## How to

### Build

Generate your `.env` file following the example in `.env.example`.

> In the future, here will be described the docker build procedure.

### Run

In your local environment, you can run with `npm start` command. You need a local mongodb installation to use Users feature at the moment.

> In the future, here will be described the docker run procedure.

### Test

In your local environment, you can test with `npm test` command. You can run a code coverage check wih `npm run test-cov` command. You can run tests on single test file with `npx mocha <path>/<file name>`, adding `--exit` option if you wanna quit asap test suite.

> In the future, here will be described the docker test procedure.

## Structure

The structure of the project is something like this:

```
-> /src
   |
   +-> /controllers: where we respond to user requests
   |
   +-> /models: where we define our data models
   |
   +-> /routes: where we define out rest api routes for user requests
   |
   +-> /storages: where we define all operations to do on our data
   |
   +-> /index.js: where we put all together

-> /test: where we define unit and functional tests
```

You can read a generic request flow as:

```
-> index.js -> route -> controller -> storage -> model -+
                                                        |
                           user <- controller storage <-+
```

In the controller, the instruction `res.status().json({})` send the response to the user.
