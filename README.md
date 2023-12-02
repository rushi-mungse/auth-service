## 🚀 Authentication Service

This repository contains a TypeScript-based Authentication Backend Service that utilizes JWT tokens for authentication using both email and OTP (One-Time Password) based authentication.

## 🛠️ Features

#### ✉️ Email Authentication

-   Users can sign up and log in using their email address. A verification email will be sent upon registration to verify the user's email.

#### 🔐 OTP Authentication

-   Users can also opt for OTP-based authentication. Upon request, a one-time password will be sent to the user's registered email or mobile number.

#### 🔑 JWT Tokens

-   JSON Web Tokens (JWT) are used for secure and stateless authentication. The tokens are generated upon successful login and should be included in the headers of subsequent requests for authorized endpoints.

#### 🔒 Password Encryption

-   User passwords are securely hashed before being stored in the database using a strong cryptographic hashing algorithm.

## Containerizing Express App for development with Docker 🐳

#### Building the Docker Image 🏗️

```
docker build -t auth-service:dev -f docker/dev/Dockerfile .
```

#### Docker Build Container Using Image 🖼️:

```
docker run --rm -it -v "$(pwd):/usr/src/app" -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 5000:5000 auth-service:dev
```

---

## Setting up PostgreSQL in a Docker Container with Persistent Volume 🐳

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

## 🚀 Getting Started

#### Clone git repository

```
git clone https://github.com/rushi-mungse/auth-service.git
```

#### Run the Service

```
npm run dev
```

## API Endpoints

### User Registration

Post: `/api/auth/register/send-otp`

```
body : {
    fullName : "Jon Doe",
    email : "jon@gmail.com",
    password : "xxxxxxxx", // min len 8
    confirmPassword : "xxxxxxxx"
}

response : {
    fullName : "Jon Doe",
    email : "jon@gmail.com",
    hashOtp : "xxxxxxxxxxxxxxx", // hashed otp
}
```

> After this api call user get otp by email then you call below verify-otp api for email verification.

Post: `/api/auth/register/verify-otp`

```
body : {
    fullName : "Jon Doe",
    email : "jon@gmail.com",
    hashOtp : "xxxxxxxxxxxxxxx",
    otp : "xxxx"
}

response : {
    id : "xxxxxxxxxxxxxxx",
    fullName : "Jon Doe",
    email : "jon@gmail.com",
}
```
