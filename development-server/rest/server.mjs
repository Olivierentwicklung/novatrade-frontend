import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PORT = 3000;

const dbPath = fileURLToPath(new URL('../data/db.json', import.meta.url));

async function readDb() {
  const content = await readFile(dbPath, 'utf8');

  return JSON.parse(content);
}

async function writeDb(db) {
  await writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });

  response.end(JSON.stringify(body));
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode);
  response.end();
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const pathname = url.pathname.replace(/\/$/, '');

    if (request.method === 'GET' && pathname === '/orders') {
      const db = await readDb();

      sendJson(response, 200, db.orders);
      return;
    }

    const orderMatch = pathname.match(/^\/orders\/([^/]+)$/);

    if (request.method === 'GET' && orderMatch) {
      const orderId = orderMatch[1];

      const db = await readDb();

      const order = db.orders.find((candidate) => candidate.id === orderId);

      if (!order) {
        sendJson(response, 404, {
          error: 'Order not found',
        });
        return;
      }

      sendJson(response, 200, order);
      return;
    }

    const placementMatch = pathname.match(/^\/orders\/([^/]+)\/place$/);

    if (request.method === 'POST' && placementMatch) {
      const orderId = placementMatch[1];

      const db = await readDb();

      const order = db.orders.find((candidate) => candidate.id === orderId);

      if (!order) {
        sendJson(response, 404, {
          error: 'Order not found',
        });
        return;
      }

      if (order.status !== 'Draft') {
        sendJson(response, 409, {
          error: 'Only draft orders can be placed',
        });
        return;
      }

      order.status = 'Submitted';

      await writeDb(db);

      sendEmpty(response, 204);
      return;
    }

    const cancellationMatch = pathname.match(/^\/orders\/([^/]+)\/cancel$/);

    if (request.method === 'POST' && cancellationMatch) {
      const orderId = cancellationMatch[1];

      const db = await readDb();

      const order = db.orders.find((candidate) => candidate.id === orderId);

      if (!order) {
        sendJson(response, 404, {
          error: 'Order not found',
        });
        return;
      }

      if (order.status !== 'Submitted') {
        sendJson(response, 409, {
          error: 'Only submitted orders can be cancelled',
        });
        return;
      }

      order.status = 'Cancelled';

      await writeDb(db);

      sendEmpty(response, 204);
      return;
    }

    sendJson(response, 404, {
      error: 'Route not found',
    });
  } catch (error) {
    console.error(error);

    sendJson(response, 500, {
      error: 'Internal development server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`NovaTrade REST development server running at http://localhost:${PORT}`);
});
