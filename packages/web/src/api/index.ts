import { Hono } from 'hono';
import { cors } from "hono/cors";
import { sessions } from './routes/sessions';
import { ai } from './routes/ai';

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route('/sessions', sessions)
  .route('/ai', ai);

export type AppType = typeof app;
export default app;
