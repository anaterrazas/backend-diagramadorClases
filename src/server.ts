import {} from "../types/express";
import dotenv from "dotenv";
import path from "path";

// Carga siempre el .env del backend, aunque Node se inicie desde otra carpeta.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import mainRouter from "./routes/index";
import { socketController } from "./modules/socket";
import { errorHandler } from "./middlewares/error-handler";

// Crear app y servidor HTTP
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);

// Rutas API
app.use("/api", mainRouter);
app.use(errorHandler);
// Ruta base
/* app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 API funcionando correctamente");
}); */

// WebSockets
socketController(io);

/* // Manejo de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("💥 Error:", err.stack);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
}); */

// Inicialización del servidor
const startServer = async () => {
  try {
    //await sequelize.sync({ force: false });
    //console.log("✅ Base de datos sincronizada");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🌐 Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
};

startServer();
