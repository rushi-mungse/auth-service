### Containerizing Express App for development with Docker 🐳

#### Building the Docker Image 🏗️

```
docker build -t auth-service:dev -f docker/dev/Dockerfile .
```

#### Docker Build Container Using Image 🖼️:

```
docker run --rm -it -v "$(pwd):/usr/src/app" -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5000:5000 auth-service:dev
```

---

### Setting up PostgreSQL in a Docker Container with Persistent Volume 🐳

#### Pull the PostgreSQL Docker image

```
docker pull postgres
```

#### Create a Persistent Volume 💾:

```
docker volume create auth-pgdata
```

#### Run the PostgreSQL container with the volume attached 🏃‍♂️:

```
docker run --rm --name auth-pgdata-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v auth-pgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres

```
