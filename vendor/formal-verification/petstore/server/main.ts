import { serve } from '@hono/node-server'
import { createApp } from './app.ts'

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: createApp().fetch, port }, () => console.log(`Pet-Store-API: http://localhost:${port}/api/v3`))
