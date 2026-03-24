import { createLocalClient } from './localdb.js';

let client = null;

export function getClient() {
  if (!client) {
    client = createLocalClient();
  }
  return client;
}
