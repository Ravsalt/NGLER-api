import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { randomUUID } from 'crypto'
import axios from 'axios'

const app = new Hono()

app.use(cors({
  origin: 'https://ngler.vercel.app',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

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
  return c.json({ message: 'NGLER Working!' });
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
