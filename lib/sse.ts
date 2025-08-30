type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
};

const clients: SSEClient[] = [];

export function addClient(id: string, controller: ReadableStreamDefaultController<Uint8Array>) {
  clients.push({ id, controller });
}

export function removeClient(id: string) {
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) clients.splice(index, 1);
}

export function broadcast(userId: string, data: object) {
  const encoder = new TextEncoder();
  const payload = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  clients.forEach((client) => {
    if (client.id === userId) {
      client.controller.enqueue(payload);
    }
  });
}
    