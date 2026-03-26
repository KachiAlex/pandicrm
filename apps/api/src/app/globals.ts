import { wsManager } from "../lib/websocket";

// This file is used to initialize the WebSocket server
// It will be imported in the main server file

export function initializeWebSocket(server: any) {
  wsManager.initialize(server);
}

// Export the WebSocket manager for use in API routes
export { wsManager };
