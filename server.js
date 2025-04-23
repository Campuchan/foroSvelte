import { createServer } from 'http';
import { handler } from './build/handler.js';
import { initSocket } from './src/lib/server/socket.js';

const server = createServer(handler);

initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});