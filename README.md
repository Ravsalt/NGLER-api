# NGLER API

NGL Link API that allows you to send multiple questions with rate limiting.

## Features

- Send multiple questions in a single request
- Configure delay between requests to avoid rate limiting
- Simple REST API interface
- Built with TypeScript and Hono.js

## Prerequisites

- Node.js 16+ or Bun
- npm, yarn, or bun package manager

## Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
# or
npm install
# or
yarn install
```

## Usage

### Start the server

```bash
bun run index.ts
# or
npm start
```

### API Endpoints

#### POST /api/submit

Send one or more questions to an NGL username.

**Request Body (JSON):**

```json
{
  "username": "target_username",
  "question": "Your question here",
  "requests": 1,
  "delay": 0
}
```

**Parameters:**

| Parameter | Type   | Required | Description                                 |
|-----------|--------|----------|---------------------------------------------|
| username  | string | Yes      | Target NGL username                         |
| question  | string | Yes      | Question to send                            |
| requests  | number | No       | Number of times to send (default: 1)        |
| delay     | number | No       | Delay between requests in ms (default: 0)   |

### Examples

**Send a single question:**

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"username":"example_user","question":"Hello from API!"}'
```

**Send multiple questions with delay:**

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"username":"example_user","question":"Hello!","requests":5,"delay":1000}'
```

**Response:**

```json
{
  "sent": 5,
  "results": [
    {"status": "success"},
    // ... more results
  ]
}
```

## License

MIT