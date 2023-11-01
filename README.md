# User Management

<img alt="NestJS" height="70" src="https://drive.google.com/uc?export=download&id=1_rJ8EderaxLPKOsUBsMyZ7AC79-FHzPo" />&nbsp;&nbsp;
<img alt="REST API" height="70" src="https://drive.google.com/uc?export=download&id=1r-uydWNt9DEdH3HZ454tz_JOduKi_e_7" />&nbsp;&nbsp;
<img alt="TypeORM" height="70" src="https://drive.google.com/uc?export=download&id=1aiNlnf9ZcVoEoDFAi3DwVnGINzOyuzWD" />&nbsp;&nbsp;
<img alt="PostreSQL" height="70" src="https://drive.google.com/uc?export=download&id=1ZpAvyLxNyD5GVwVOyxpnEH9qTKx2ICJJ" />&nbsp;&nbsp;
<img alt="Docker" height="70" src="https://drive.google.com/uc?export=download&id=1H_xnywHh-LsaGKcbPpA4ftJXUsYd_YP8" />&nbsp;&nbsp;
<img alt="AWS S3" height="70" src="https://drive.google.com/uc?export=download&id=1WCUbfGiWwOYC1nGSxPoD3lh5jHCind1T" />&nbsp;&nbsp;
<img alt="AWS EC2" height="70" src="https://drive.google.com/uc?export=download&id=1zAcogeDM9McUWaJitNp61ZF_swkKsuTt" />&nbsp;&nbsp;

The service is responsible for user management, authentication and authorization
(with roles). It was created using NestJS, and PostgreSQL is used for data
storage through TypeORM. Interaction with AWS S3 for storing user avatars has
been implemented. The service also includes Swagger documentation and unit
tests, as well as end-to-end tests.

You can familiarize with the API through
[Swagger](https://ec2-52-58-90-89.eu-central-1.compute.amazonaws.com/um/api/docs).

To run the project locally, first install npm dependencies using the npm install
command and set environment variables in the .env file. See the example in the
.env.example file.

### To run the project use one of the following commands:

```bash
$ npm start

# in development mode
$ npm run start:dev
```

### The project consists of two main modules:

- auth - responsible for operations related to authentication
- user - implementing functionality for user editing, adding avatar and voting

### DB schema:

User:

```
{
	id: uuid,
	nickname: string,
	firstName: string,
	lastName: string,
	password: string,
	role: 'user' | 'moderator' | 'admin',
	rating: number,
	createdAt: Date,
	updatedAt: Date,
	deletedAt: Date
}
```

Token:

```
{
	id: uuid,
	token: string,
	userId: uuid (many-to-one)
}
```

Avatar:

```
{
	id: uuid,
	avatarUrl: string,
	userId: uuid (many-to-one)
}
```

Vote:

```
{
	id: uuid,
	userId: uuid,
	targetUserId: uuid,
	voteValue: number (many-to-one)
}
```
