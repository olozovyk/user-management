# User Management

<img alt="NestJS" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/nestjs_h70.png" />&nbsp;&nbsp;
<img alt="REST API" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/rest_h70.png" />&nbsp;&nbsp;
<img alt="TypeORM" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/typeorm_h70.png" />&nbsp;&nbsp;
<img alt="PostreSQL" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/postgres_h70.png" />&nbsp;&nbsp;
<img alt="Docker" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/docker_h70.png" />&nbsp;&nbsp;
<img alt="AWS S3" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/s3_h70.png" />&nbsp;&nbsp;
<img alt="AWS EC2" height="70" src="https://github-tools-icons.s3.eu-central-1.amazonaws.com/ec2_h70.png" />&nbsp;&nbsp;

The service is responsible for user management, authentication and authorization
(with roles). It was created using NestJS, and PostgreSQL is used for data
storage through TypeORM. Interaction with AWS S3 for storing user avatars has
been implemented. The service also includes Swagger documentation and unit
tests, as well as end-to-end tests.

You can familiarize with the API through
[Swagger](https://ec2-52-58-90-89.eu-central-1.compute.amazonaws.com/um/api/docs).

To run the project locally, first install npm dependencies using the npm install
command and set environment variables in the `.env` file. See the example in the
`.env.example` file.

### To run the project use one of the following commands:

```bash
$ npm start

# in development mode
$ npm run start:dev
```

Base URL for local API deployment: `localhost:PORT/um/api/` Set the port value
in your `.env` file and replace PORT with the specified value before launching
the API server.

### The project consists of two main modules:

- auth - responsible for operations related to authentication
- user - implementing functionality for user editing, adding avatar and voting

### DB schema:

<img alt="Entity relationship diagram" width="900" src="./readme/um-entities.png">
