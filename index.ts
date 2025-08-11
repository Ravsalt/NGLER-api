import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { randomUUID } from 'crypto'
import axios from 'axios'

const app = new Hono()

const NGL_API_URL = 'https://ngl.link/api/submit'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function sendToNgl(username: string, question: string, deviceId: string) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Accept: '*/*',
    Origin: 'https://ngl.link',
    Referer: `https://ngl.link/${username}`,
    'X-Requested-With': 'XMLHttpRequest'
  }

  const data = new URLSearchParams({
    username,
    question,
    deviceId,
    gameSlug: '',
    referrer: ''
  })

  try {
    const res = await axios.post(NGL_API_URL, data.toString(), { headers })
    return res.data
  } catch (err: any) {
    return { error: err.message }
  }
}

app.post('/api/submit', async (c) => {
  const { username, question, requests = 1, delay = 0 } = await c.req.json()

  if (!username || !question) {
    return c.json({ error: 'Missing required fields: username, question' }, 400)
  }

  const results: any[] = []

  for (let i = 0; i < Number(requests); i++) {
    const deviceId = randomUUID()
    const result = await sendToNgl(username, question, deviceId)
    results.push(result)

    if (delay > 0 && i < requests - 1) {
      await sleep(delay)
    }
  }

  return c.json({ sent: results.length, results })
})

app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NGL API Proxy</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #09f;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>NGL API Proxy is Working! 🚀</h1>
          <p>Redirecting to GitHub repository...</p>
          <div class="spinner"></div>
          <p>If you're not redirected, <a href="https://github.com/Ravsalt/NGLER-api">click here</a>.</p>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = 'https://github.com/Ravsalt/NGLER-api';
          }, 3000);
        </script>
      </body>
    </html>
  `;
  return c.html(html);
})

// For Vercel serverless functions
export default app

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT) || 3000
  console.log(`Server is running on http://localhost:${port}`)
  serve({
    fetch: app.fetch,
    port
  })
}
