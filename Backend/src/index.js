// Imports environment variables from the .env file using the 'dotenv' package.
// This securely loads variables like CORS_ORIGIN, PORT, and MONGODB_URI into Node's process.env so they aren't hardcoded in the codebase.
import "dotenv/config.js";
import http from "http";
import { Server } from "socket.io";

import { app } from "./app.js";
import connectDb from "./db/index.js";
import redisClient from "./utils/redisClient.js";

// --- Socket.io Setup ---
const server = http.createServer(app);
const allowedOrigin = process.env.NODE_ENV === 'production' 
  ? process.env.CORS_ORIGIN || "https://engineer-on-click.vercel.app" 
  : "http://localhost:5173";

const io = new Server(server, {
  cors: {
    // 'credentials: true' strictly forbids origin from being '*'. 
    // If CORS_ORIGIN is '*' or undefined, we safely fallback to the local React dev server URL.
    // When deployed on Render, ensure CORS_ORIGIN is set to your Vercel frontend URL in the Render dashboard.
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make 'io' accessible in all Express controllers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected via WebSocket:", socket.id);

  // Place the user in specific rooms based on their role and ID
  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id); // Personal room for customer/engineer
      if (userData.role === "admin") {
        socket.join("admin_room"); // Dedicated room for admin notifications
      }
      console.log(`User ${userData.fullName || userData._id} joined their rooms`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// -----------------------

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDb();
  isConnected = true;
};

// For Vercel serverless
if (process.env.VERCEL) {
  connectToDatabase();
} else {
  // For traditional server (Render, Railway, local)
  connectDb()
    .then(() => {
      server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT || 8000}`);
      });
    })
    .catch((err) => {
      console.log("mongoDB connection fail", err);
    });
}

export default app;
