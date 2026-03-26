import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

export interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  workspaceId?: string;
  timestamp: string;
}

export interface ClientConnection {
  id: string;
  userId: string;
  workspaceId: string;
  socket: WebSocket;
  rooms: Set<string>;
  lastActivity: Date;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  constructor() {
    this.setupHeartbeat();
  }

  initialize(server: any) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    console.log('WebSocket server initialized');
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage) {
    const clientId = this.generateClientId();
    
    // Parse connection URL for auth params
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const workspaceId = url.searchParams.get('workspaceId');

    if (!userId || !workspaceId) {
      ws.close(1008, 'Missing authentication parameters');
      return;
    }

    const client: ClientConnection = {
      id: clientId,
      userId,
      workspaceId,
      socket: ws,
      rooms: new Set(),
      lastActivity: new Date(),
    };

    this.clients.set(clientId, client);

    // Setup message handlers
    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection_established',
      data: { clientId },
      timestamp: new Date().toISOString(),
    });

    // Join default rooms
    this.joinRoom(clientId, `user:${userId}`);
    this.joinRoom(clientId, `workspace:${workspaceId}`);
    this.joinRoom(clientId, `workspace:${workspaceId}:notifications`);

    console.log(`Client ${clientId} connected (User: ${userId}, Workspace: ${workspaceId})`);
  }

  private handleMessage(clientId: string, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) return;

      // Update last activity
      client.lastActivity = new Date();

      // Handle different message types
      switch (message.type) {
        case 'join_room':
          this.joinRoom(clientId, message.data.room);
          break;
        case 'leave_room':
          this.leaveRoom(clientId, message.data.room);
          break;
        case 'heartbeat':
          // Heartbeat received, update activity
          break;
        default:
          // Broadcast message to relevant rooms
          this.broadcastToRooms(clientId, message);
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error);
    }
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId);
    
    if (client) {
      // Leave all rooms
      client.rooms.forEach(room => {
        this.leaveRoom(clientId, room);
      });

      // Remove client
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    }
  }

  private joinRoom(clientId: string, room: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.add(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(clientId);

    // Notify client they joined the room
    this.sendToClient(clientId, {
      type: 'room_joined',
      data: { room },
      timestamp: new Date().toISOString(),
    });
  }

  private leaveRoom(clientId: string, room: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.delete(room);

    const roomClients = this.rooms.get(room);
    if (roomClients) {
      roomClients.delete(clientId);
      
      // Clean up empty rooms
      if (roomClients.size === 0) {
        this.rooms.delete(room);
      }
    }

    // Notify client they left the room
    this.sendToClient(clientId, {
      type: 'room_left',
      data: { room },
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastToRooms(senderClientId: string, message: WebSocketMessage) {
    const sender = this.clients.get(senderClientId);
    if (!sender) return;

    sender.rooms.forEach(room => {
      this.broadcastToRoom(room, message, senderClientId);
    });
  }

  private broadcastToRoom(room: string, message: WebSocketMessage, excludeClientId?: string) {
    const roomClients = this.rooms.get(room);
    if (!roomClients) return;

    const messageToSend = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    roomClients.forEach(clientId => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, messageToSend);
      }
    });
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    }
  }

  // Public API methods
  public broadcastToWorkspace(workspaceId: string, message: WebSocketMessage) {
    this.broadcastToRoom(`workspace:${workspaceId}`, message);
  }

  public broadcastToUser(userId: string, message: WebSocketMessage) {
    this.broadcastToRoom(`user:${userId}`, message);
  }

  public sendNotification(workspaceId: string, notification: any) {
    this.broadcastToRoom(`workspace:${workspaceId}:notifications`, {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastTaskUpdate(workspaceId: string, task: any, action: 'created' | 'updated' | 'deleted' | 'completed') {
    this.broadcastToWorkspace(workspaceId, {
      type: 'task_update',
      data: { task, action },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastNoteUpdate(workspaceId: string, note: any, action: 'created' | 'updated' | 'deleted' | 'shared' | 'transcribed') {
    this.broadcastToWorkspace(workspaceId, {
      type: 'note_update',
      data: { note, action },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastRitualUpdate(workspaceId: string, ritual: any, action: 'created' | 'updated' | 'deleted' | 'completed') {
    this.broadcastToWorkspace(workspaceId, {
      type: 'ritual_update',
      data: { ritual, action },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastCRMUpdate(workspaceId: string, entityType: 'account' | 'contact' | 'deal', entity: any, action: 'created' | 'updated' | 'deleted') {
    this.broadcastToWorkspace(workspaceId, {
      type: 'crm_update',
      data: { entityType, entity, action },
      timestamp: new Date().toISOString(),
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private setupHeartbeat() {
    setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30 seconds

      this.clients.forEach((client, clientId) => {
        if (now.getTime() - client.lastActivity.getTime() > timeout) {
          console.log(`Client ${clientId} timed out, disconnecting`);
          client.socket.close(1000, 'Heartbeat timeout');
          this.handleDisconnection(clientId);
        } else {
          // Send heartbeat
          this.sendToClient(clientId, {
            type: 'heartbeat',
            data: {},
            timestamp: now.toISOString(),
          });
        }
      });
    }, 15000); // Check every 15 seconds
  }

  public getStats() {
    return {
      connectedClients: this.clients.size,
      activeRooms: this.rooms.size,
      clients: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        userId: client.userId,
        workspaceId: client.workspaceId,
        roomCount: client.rooms.size,
        lastActivity: client.lastActivity,
      })),
    };
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();
