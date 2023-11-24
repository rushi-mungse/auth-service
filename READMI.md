### Docker Build Image Using Docker File

```
docker build -t auth-service:dev -f docker/dev/Dockerfile .
```

### Docker Build Container Using Image

```
docker run --rm -it -v "$(pwd):/usr/src/app" -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5000:5000 auth-service:dev
```
