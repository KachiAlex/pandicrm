import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeWebSocket } from "./app/globals";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Create the Next.js server
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create HTTP server
const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

// Initialize WebSocket server
server.on("listening", () => {
  initializeWebSocket(server);
});

// Start the server
server.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
