import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({limit:"160kb"})) // Increased limit for large transcripts
app.use(express.urlencoded({extended:true,limit:"160kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Engineer-On-Click API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// routes import 
import userRouter from './routes/user.routes.js'
import contactRouter from './routes/contact.routes.js'
import bookEngineerRouter from './routes/bookEngineer.router.js'
import branchRouter from './routes/branchRouter.js'
import { bookEngineer, getAllEngineerRequests } from "./controllers/bookEnginner.controller.js";



//routes declaration
app.use('/api/v1/users',userRouter)
app.use('/api/v1',contactRouter)
app.use('/api/v1',bookEngineerRouter)
app.use('/api/v1/admin-dashboard',userRouter)
app.use('/api/v1/branches',branchRouter)
app.use('/api/v1/admin-dashboard',bookEngineerRouter)
app.use('/api/v1/admin-dashboard',bookEngineerRouter)



// http://localhost:8000/api/v1/users/register

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err); // Log error for server-side debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});


export { app };
