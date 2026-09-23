"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carga siempre el .env del backend, aunque Node se inicie desde otra carpeta.
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const index_1 = __importDefault(require("./routes/index"));
const socket_1 = require("./modules/socket");
const error_handler_1 = require("./middlewares/error-handler");
// Crear app y servidor HTTP
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        credentials: true,
    },
});
// Middlewares globales
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
}));
// Rutas API
app.use("/api", index_1.default);
app.use(error_handler_1.errorHandler);
// Ruta base
/* app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 API funcionando correctamente");
}); */
// WebSockets
(0, socket_1.socketController)(io);
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
    }
    catch (err) {
        console.error("❌ Error al iniciar el servidor:", err);
    }
};
startServer();
