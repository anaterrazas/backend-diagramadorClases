"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const rooms = new Map();
function ensureRoom(room) {
    let st = rooms.get(room);
    if (!st) {
        st = {
            model: { classes: {}, links: {} },
            lastReplace: null,
            locks: { classes: {}, links: {} },
            clients: new Set(),
        };
        rooms.set(room, st);
    }
    return st;
}
function registerSocketHandlers(io, socket) {
    let currentRoom = null;
    let clientId = null;
    /* ---------- join / state ---------- */
    socket.on('room:join', ({ room, clientId: cid }) => {
        if (!room || !cid)
            return;
        currentRoom = room;
        clientId = cid;
        socket.join(room);
        const st = ensureRoom(room);
        st.clients.add(cid);
        io.to(room).emit('presence:clients', { clients: [...st.clients] });
    });
    socket.on('state:get', ({ room }) => {
        const st = ensureRoom(room);
        // Si hubo un replace V2, se prioriza para hidratar correctamente
        if (st.lastReplace) {
            socket.emit('state:replace', { model: st.lastReplace });
        }
        else {
            socket.emit('state:set', { model: st.model });
        }
        socket.emit('locks:set', st.locks);
    });
    /* ---------- state:replace (V2 completo) ---------- */
    socket.on('state:replace', ({ room, model }) => {
        const st = ensureRoom(room);
        st.lastReplace = model; // guardamos el último replace para nuevos clientes
        socket.to(room).emit('state:replace', { model }); // broadcast (el emisor ya lo tiene)
    });
    /* ---------- locks (best-effort) ---------- */
    socket.on('lock', ({ room, clientId: owner, kind, id }) => {
        const st = ensureRoom(room);
        const box = kind === 'class' ? st.locks.classes : st.locks.links;
        if (box[id] && box[id] !== owner)
            return;
        box[id] = owner;
        socket.to(room).emit('locked', { kind, id, clientId: owner });
    });
    socket.on('unlock', ({ room, kind, id }) => {
        const st = ensureRoom(room);
        const box = kind === 'class' ? st.locks.classes : st.locks.links;
        delete box[id];
        socket.to(room).emit('unlocked', { kind, id });
    });
    /* ---------- operaciones incrementales (v1) ---------- */
    socket.on('op', ({ room, clientId: from, type, payload }) => {
        const st = ensureRoom(room);
        switch (type) {
            case 'class.add': {
                const { id, x, y, name, attributes, methods, w, h } = payload;
                st.model.classes[id] = { id, x, y, name, attributes, methods, w, h };
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'class.move': {
                const { id, x, y } = payload;
                const c = st.model.classes[id];
                if (c) {
                    c.x = x;
                    c.y = y;
                }
                else {
                    st.model.classes[id] = { id, x, y };
                }
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'class.update': {
                const p = payload;
                const c = st.model.classes[p.id];
                if (!c)
                    return;
                if (p.name !== undefined)
                    c.name = p.name;
                if (p.attributes !== undefined)
                    c.attributes = p.attributes;
                if (p.methods !== undefined)
                    c.methods = p.methods;
                if (p.w !== undefined)
                    c.w = p.w;
                if (p.h !== undefined)
                    c.h = p.h;
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'class.delete': {
                const { id } = payload;
                if (!st.model.classes[id])
                    return;
                delete st.model.classes[id];
                for (const lid of Object.keys(st.model.links)) {
                    const L = st.model.links[lid];
                    if (L.sourceId === id || L.targetId === id || L.assocClassId === id) {
                        delete st.model.links[lid];
                    }
                }
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'link.add': {
                const p = payload;
                st.model.links[p.id] = {
                    id: p.id, kind: p.kind, sourceId: p.sourceId, targetId: p.targetId,
                    labels: p.labels ?? {}, assocClassId: p.assocClassId ?? null,
                    anchorSrc: p.anchorSrc ?? null, anchorTgt: p.anchorTgt ?? null,
                };
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'link.update': {
                const p = payload;
                const L = st.model.links[p.id];
                if (!L)
                    return;
                if (p.kind !== undefined)
                    L.kind = p.kind;
                if (p.labels !== undefined)
                    L.labels = p.labels;
                if ('assocClassId' in p)
                    L.assocClassId = p.assocClassId ?? null;
                if (p.sourceId !== undefined) {
                    L.sourceId = p.sourceId;
                    if (!('anchorSrc' in p))
                        L.anchorSrc = null;
                }
                if (p.targetId !== undefined) {
                    L.targetId = p.targetId;
                    if (!('anchorTgt' in p))
                        L.anchorTgt = null;
                }
                if ('anchorSrc' in p)
                    L.anchorSrc = p.anchorSrc ?? null;
                if ('anchorTgt' in p)
                    L.anchorTgt = p.anchorTgt ?? null;
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            case 'link.delete': {
                const { id } = payload;
                delete st.model.links[id];
                socket.to(room).emit('op', { clientId: from, type, payload });
                return;
            }
            default:
                return;
        }
    });
    /* ---------- disconnect ---------- */
    socket.on('disconnect', () => {
        if (!currentRoom || !clientId)
            return;
        const st = ensureRoom(currentRoom);
        st.clients.delete(clientId);
        for (const [id, owner] of Object.entries(st.locks.classes)) {
            if (owner === clientId) {
                delete st.locks.classes[id];
                io.to(currentRoom).emit('unlocked', { kind: 'class', id });
            }
        }
        for (const [id, owner] of Object.entries(st.locks.links)) {
            if (owner === clientId) {
                delete st.locks.links[id];
                io.to(currentRoom).emit('unlocked', { kind: 'link', id });
            }
        }
        io.to(currentRoom).emit('presence:clients', { clients: [...st.clients] });
    });
}
