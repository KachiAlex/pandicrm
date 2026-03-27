export interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  workspaceId?: string;
  timestamp: string;
}

export interface WebSocketClientOptions {
  url: string;
  userId: string;
  workspaceId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManualClose = false;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      onMessage: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      ...options,
    };

    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.isManualClose) {
      return;
    }

    this.isConnecting = true;

    const wsUrl = `${this.options.url}?userId=${this.options.userId}&workspaceId=${this.options.workspaceId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.options.onConnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      
      if (!this.isManualClose) {
        this.handleReconnect();
      }
      
      this.options.onDisconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.options.onError(error);
    };
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle different message types
    switch (message.type) {
      case "heartbeat":
        // Respond to server heartbeat
        this.send({ type: "heartbeat", data: {} });
        break;
      
      case "connection_established":
        console.log("WebSocket connection established with client ID:", message.data.clientId);
        break;
      
      case "room_joined":
        console.log("Joined room:", message.data.room);
        break;
      
      case "room_left":
        console.log("Left room:", message.data.room);
        break;
      
      default:
        // Pass all other messages to the handler
        this.options.onMessage(message);
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "heartbeat", data: {} });
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.options.reconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public send(message: Omit<WebSocketMessage, "timestamp">) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected, message not sent:", message);
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }
  }

  public joinRoom(room: string) {
    this.send({ type: "join_room", data: { room } });
  }

  public leaveRoom(room: string) {
    this.send({ type: "leave_room", data: { room } });
  }

  public disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): string {
    if (!this.ws) return "disconnected";
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return "connecting";
      case WebSocket.OPEN: return "connected";
      case WebSocket.CLOSING: return "closing";
      case WebSocket.CLOSED: return "closed";
      default: return "unknown";
    }
  }
}

// React hook for WebSocket
import { useEffect, useRef, useState } from "react";

export function useWebSocket(options: WebSocketClientOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    // Create WebSocket client
    wsClientRef.current = new WebSocketClient({
      ...options,
      onConnect: () => {
        setIsConnected(true);
        setConnectionState("connected");
        options.onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionState("disconnected");
        options.onDisconnect?.();
      },
      onError: (error) => {
        setConnectionState("error");
        options.onError?.(error);
      },
      onMessage: (message) => {
        setLastMessage(message);
        options.onMessage?.(message);
      },
    });

    // Cleanup on unmount
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, [options.url, options.userId, options.workspaceId]);

  const send = (message: Omit<WebSocketMessage, "timestamp">) => {
    wsClientRef.current?.send(message);
  };

  const joinRoom = (room: string) => {
    wsClientRef.current?.joinRoom(room);
  };

  const leaveRoom = (room: string) => {
    wsClientRef.current?.leaveRoom(room);
  };

  const disconnect = () => {
    wsClientRef.current?.disconnect();
  };

  return {
    isConnected,
    connectionState,
    lastMessage,
    send,
    joinRoom,
    leaveRoom,
    disconnect,
  };
}

// Global WebSocket manager for app-wide connection
class GlobalWebSocketManager {
  private client: WebSocketClient | null = null;
  private currentOptions: WebSocketClientOptions | null = null;

  public connect(options: WebSocketClientOptions) {
    if (this.client) {
      this.client.disconnect();
    }

    this.currentOptions = options;
    this.client = new WebSocketClient(options);
    return this.client;
  }

  public disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.currentOptions = null;
  }

  public getClient(): WebSocketClient | null {
    return this.client;
  }

  public isConnected(): boolean {
    return this.client?.isConnected() || false;
  }

  public send(message: Omit<WebSocketMessage, "timestamp">) {
    this.client?.send(message);
  }

  public joinRoom(room: string) {
    this.client?.joinRoom(room);
  }

  public leaveRoom(room: string) {
    this.client?.leaveRoom(room);
  }
}

export const globalWebSocketManager = new GlobalWebSocketManager();
