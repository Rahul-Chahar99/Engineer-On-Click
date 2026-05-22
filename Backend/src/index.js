// Imports environment variables from the .env file using the 'dotenv' package.
// This securely loads variables like CORS_ORIGIN, PORT, and MONGODB_URI into Node's process.env so they aren't hardcoded in the codebase.
import "dotenv/config.js";
import http from "http";
import { Server } from "socket.io";

import { app } from "./app.js";
import connectDb from "./db/index.js";
import redisClient from "./utils/redisClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Socket.io Setup ---
const server = http.createServer(app);
const allowedOrigin =
  process.env.NODE_ENV === "production"
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

//Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

io.on("connection", (socket) => {
  console.log("A user connected via WebSocket:", socket.id);

  // Place the user in specific rooms based on their role and ID
  socket.on("setup", (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id); // Personal room for customer/engineer
      if (userData.role === "admin") {
        socket.join("admin_room"); // Dedicated room for admin notifications
      }
      console.log(
        `User ${userData.fullName || userData._id} joined their rooms`
      );
    }
  });
  // Listen for messages from the React frontend
  socket.on("sendMessage", async (userMessage) => {
    try {
      // Use Gemini 1.5 Flash (the current recommended standard)
      // Use the current stable Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const systemPrompt = `You are a helpful, friendly customer support assistant (Helsinki your name) for "Engineer on Click". 
            Engineer on Click is a platform where users can book professional engineers for various services.
            Keep your answers short, professional, and helpful. Do not use complex formatting.
            if user ask for any thing more than engineer on click related then politely refuse to answer and say "Sorry, I can only assist with questions related to Engineer on Click. Please contact our support team for further assistance."
            
            User message: ${userMessage}`;
      const result = await model.generateContent(systemPrompt);
      const aiReply = result.response.text();
      // Emit the AI's reply back to this specific user's browser
      socket.emit("receiveMessage", { text: aiReply });
    } catch (error) {
      console.error("Gemini AI Error:", error);
      socket.emit("receiveMessage", {
        text: "Sorry, our systems are currently busy. Please try again later.",
      });
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
