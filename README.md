

# Task Tracker API Documentation

The Task Tracker API provides endpoints for user registration, authentication, task management, sub-task management, and cron job scheduling. This document outlines the available endpoints along with their functionalities.


## API Reference

#### Registration Endpoint

```http
  POST api/auth/registration
```
**Register a new user**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `phone_number` | `string` | **Required**. |
| `password` | `string` | **Required**. |

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful registration. |
| `500` | `Internal Server Error` | if registration fails. |


### Login Endpoint 
```http
  POST api/auth/login
```
**Login user**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `phone_number` | `string` | **Required**. |
| `password` | `string` | **Required**. |

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful login. |
| `500` | `Internal Server Error` | if registration login. |

### Task Creation Endpoint 
```http
  POST api/task
```
**Task Creation**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `user_id` | `string` | **Required**. |
| `task_name` | `string` | **Required**. |
| `description` | `string` | **Required**. |
| `priority` | `number` | **Required**. |
| `due_date` | `string` | **Required**. |

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful task creation. |
| `400` | `Bad Request` | if task creation fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |

### Task Updation Endpoint 
```http
  PATCH api/task
```
**Task Updation**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `task_ud` | `number` | **Required**. |
| `status` | `string` | **Optional**. |
| `due_date` | `string` | **Optional**. |

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful task Updation. |
| `400` | `Bad Request` | if task Updation fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |

### Task Deletion Endpoint 
```http
  DELETE api/task
```
**Soft Task Deletion By Task ID**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `task_id` | `number` | **Required**. |


**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful Deletion. |
| `400` | `Bad Request` | if Deletion fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |

### Sub Task Creation Endpoint 
```http
  POST api/sub-task
```
**Task Creation By Task ID**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `task_id` | `number` | **Required**. |


**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful sub-task creation. |
| `400` | `Bad Request` | if sub-task creation fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |


### Sub Task Updation Endpoint 
```http
  PATCH api/sub-task
```
**Task Updation By Task ID**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `task_id` | `number` | **Required**. |
| `status` | `number` | **Optional**. |


**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful sub-task Updation. |
| `400` | `Bad Request` | if sub-task Updation fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |

### Sub Task Deletion Endpoint 
```http
  DELETE api/sub-task
```
**Task Deletion By Task ID**
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `task_id` | `number` | **Required**. |
| `status` | `number` | **Optional**. |


**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful sub-task Deletion. |
| `400` | `Bad Request` | if sub-task Deletion fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |


```http
  GET /api/task/123?priority=high&due_date=2024-03-20&page=1&limit=10

```

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful task retireval. |
| `400` | `Bad Request` | if task retireval fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |

```http
  GET  /api/sub-task/123


```

**Response**
| status Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `200` | `Ok` | on successful task retireval. |
| `400` | `Bad Request` | if task retireval fails. |
| `401` | `Unauthorized` | if the user is unauthorized. |



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`

`ANOTHER_API_KEY`

PORT = "PORT FOR SERVER"
USER = "DB_USER"
HOST = "DB_HOST"
DB = "DB_NAME"
PASSWORD = "DB_PASSWORD"
DB_PORT = "DB_PORT"
NODE_ENV = 'development'
SECRET = 'JWTSECERT'
TWILIO_ACCOUNT_SID = ""
TWILIO_AUTH_TOKEN = ""
## Installation

Install my-project with npm

```bash
  git clone https://github.com/rajgupta-ml/Task-Tracker.git
  cd task-tracker/server
  npm i 
  npm run build
```

## Improvement which can be done in codebase

//--- Separating the cron function onto a different Node.js server
//--- Calling the interactors through a controller
//--- Creating type interfaces for the response
//--- Writing unit tests for each API endpoint using Jest
//--- Logging all errors to the PostgreSQL table





