# weather-vortex-server

Server for Weather Vortex Project.

## Table of contents

- [How to](#how-to)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)

## How to

### Build

Generate your `.env` file following the example in `.env.example`.

In local environment, you don't need anything to build this project, since it's all in Javascript. Just run

```sh
npm install
```

in route folder to install all dependencies.

To build Docker image, run the following command:

```sh
sudo docker build . -t <your username>/weather-vortex-server
```

You can see your container image with `docker images`.

### Run

In your local environment, you can run with `npm start` command. You need a local mongodb installation to use Users feature at the moment. You can use a mongodb container too.

> In the future, we'll create a repository with a docker-compose file to generate a local environment with server, database and client containers ready to execute.

To run your container, use the following command:

```sh
sudo docker run -p 49161:12000 -d <your username>/weather-vortex-server
```

Since this is a detached container, to see all logs run

```sh
sudo docker ps
sudo docker logs <container id>
```

### Test

In your local environment, you can test with `npm run test` command. You can run a code coverage check wih `npm run test-cov` command. Produce an html report with `npm run test-cov:html`.

Navigate in your browser to `localhost:12000` to see the server ok page, or in your shell use those commands:

```sh
curl -i localhost:49161
```
