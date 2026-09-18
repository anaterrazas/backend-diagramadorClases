"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketController = void 0;
const socketJWTAuth_1 = require("../../middlewares/socketJWTAuth");
const socket_controller_1 = require("./socket.controller");
const socketController = (io) => {
    io.use(socketJWTAuth_1.socketJWTAuth); // si no usas auth, puedes quitar esta línea
    io.on('connection', (socket) => {
        (0, socket_controller_1.registerSocketHandlers)(io, socket);
    });
};
exports.socketController = socketController;
