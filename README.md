# weather-vortex-server

Server for Weather Vortex Project.

**Table of contents**

- [How to](#how-to)
  - [Build](#build)
  - [Run](#run)
  - [Test](#test)
- [Structure](#structure)

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
docker build . -t <your username>/weather-vortex-server
```

You can see your container image with `docker images`.

### Run

In your local environment, you can run with `npm start` command. You need a local mongodb installation to use Users feature at the moment. You can use a mongodb container too.

> In the future, we'll create a repository with a docker-compose file to generate a local environment with server, database and client containers ready to execute.

To run your container, use the following command:

```sh
docker run -p 49161:12000 -d <your username>/weather-vortex-server
```

Since this is a detached container, to see all logs run

```sh
docker ps
docker logs <container id>
```

### Test

In your local environment, you can test with `npm run test` command. You can run a code coverage check wih `npm run test-cov` command. Produce an html report with `npm run test-cov:html`.

Navigate in your browser to `localhost:12000` to see the server ok page, or in your shell use those commands:

```sh
$ curl -i localhost:49161

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-51rzdr5zfwWQpf+iUepheZg7siQ"
Date: Mon, 09 Aug 2021 20:38:01 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"result":"ok"}
```

In local environment, you should have a working mongodb installation or use a container:

```sh
docker run -p 27017:27017 -d mongo

docker ps

CONTAINER ID   IMAGE                                    CREATED         STATUS          PORTS
2fffd3d83939   mongo                                    4 seconds ago   Up 3 seconds    0.0.0.0:27017->27017/tcp, :::27017->27017/tcp
64bbb7ec15d7   daniele.tentoni2/weather-vortex-server   4 minutes ago   Up 4 minutes    15600/tcp, 0.0.0.0:49161->12000/tcp, :::49161->12000/tcp
```

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
