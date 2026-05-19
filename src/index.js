import { createServer } from 'node:http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { initCache } from './services/cacheService.js';
import { initSocket } from './sockets/socketManager.js';
import { startMarketScheduler } from './schedulers/marketScheduler.js';
import { connectDatabase } from './services/database.service.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = createApp();
const httpServer = createServer(app);
const io = initSocket(httpServer);

await connectDatabase();
await initCache();
startMarketScheduler(io);

httpServer.listen(port, () => {
  console.log(`Trading signal server listening on ${port}`);
});
