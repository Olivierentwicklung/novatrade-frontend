import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildSchema, graphql } from 'graphql';

const PORT = 3000;

const dbPath = fileURLToPath(new URL('../data/db.json', import.meta.url));

const schema = buildSchema(`
  type OrderLine {
    productName: String!
    quantity: Int!
    unitPrice: Float!
  }

  type Order {
    id: ID!
    status: String!
    lines: [OrderLine!]!
    total: Float!
  }

  type OrderSummary {
    id: ID!
    status: String!
    total: Float!
    itemCount: Int!
  }

  type MutationResult {
    success: Boolean!
  }

  type Query {
    order(id: ID!): Order
    orders: [OrderSummary!]!
  }

  type Mutation {
    placeOrder(id: ID!): MutationResult!
    cancelOrder(id: ID!): MutationResult!
  }
`);

async function readDb() {
  const content = await readFile(dbPath, 'utf8');
  return JSON.parse(content);
}

async function writeDb(db) {
  await writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

function toOrder(order) {
  return {
    id: order.id,
    status: order.status,
    lines: order.lines.map((line) => ({
      productName: line.product_name,
      quantity: line.quantity,
      unitPrice: line.unit_price,
    })),
    total: order.total,
  };
}

const rootValue = {
  async order({ id }) {
    const db = await readDb();
    const order = db.orders.find((candidate) => candidate.id === id);

    return order ? toOrder(order) : null;
  },

  async orders() {
    const db = await readDb();

    return db.orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      itemCount: order.lines.length,
    }));
  },

  async placeOrder({ id }) {
    const db = await readDb();
    const order = db.orders.find((candidate) => candidate.id === id);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'Draft') {
      throw new Error('Only draft orders can be placed');
    }

    order.status = 'Submitted';
    await writeDb(db);

    return { success: true };
  },

  async cancelOrder({ id }) {
    const db = await readDb();
    const order = db.orders.find((candidate) => candidate.id === id);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'Submitted') {
      throw new Error('Only submitted orders can be cancelled');
    }

    order.status = 'Cancelled';
    await writeDb(db);

    return { success: true };
  },
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });

  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method !== 'POST' || url.pathname !== '/graphql') {
      sendJson(response, 404, {
        error: 'Route not found',
      });
      return;
    }

    const body = await readJsonBody(request);

    const result = await graphql({
      schema,
      source: body.query,
      variableValues: body.variables,
      rootValue,
    });

    sendJson(response, 200, result);
  } catch (error) {
    console.error(error);

    sendJson(response, 500, {
      error: 'Internal development server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`NovaTrade GraphQL development server running at http://localhost:${PORT}/graphql`);
});
