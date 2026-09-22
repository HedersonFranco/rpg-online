import { EventEmitter } from "node:events";
import { createServer, type Server } from "node:http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ExpressPeerServer } from "peer";
import { usuarioRoutes } from "./modules/usuario/usuario.routes.js";
import { salaRoutes } from "./modules/sala/sala.routes.js";
import { fichaRoutes } from "./modules/ficha/ficha.routes.js";
import { npcRoutes } from "./modules/npc/npc.routes.js";
import { pastaRoutes } from "./modules/pasta/pasta.routes.js";
import { mapaRoutes, tokenRoutes } from "./modules/mapa/mapa.routes.js";
import { rtcRoutes } from "./modules/rtc/rtc.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { iniciarSocket } from "./sockets/io.js";
import { PASTA_UPLOADS } from "./lib/armazenamento.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// nosniff: o navegador nunca trata um arquivo enviado como outra coisa além do tipo servido.
app.use(
  "/uploads",
  express.static(PASTA_UPLOADS, {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  }),
);

// Sinalização do WebRTC (PeerJS) no próprio servidor — não depende do servidor público do PeerJS.
// O PeerJS usa a lib `ws`, que responde 400 pra QUALQUER upgrade de WebSocket fora
// do caminho dela — isso derrubava o Socket.IO. Então ele recebe um emissor
// intermediário e só os upgrades de /peerjs são repassados.
const upgradesPeerJs = new EventEmitter();
httpServer.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/peerjs")) upgradesPeerJs.emit("upgrade", req, socket, head);
});
app.use("/peerjs", ExpressPeerServer(upgradesPeerJs as unknown as Server, { path: "/" }));

app.use("/auth", usuarioRoutes);
app.use("/salas", salaRoutes);
app.use("/fichas", fichaRoutes);
app.use("/npcs", npcRoutes);
app.use("/pastas", pastaRoutes);
app.use("/mapas", mapaRoutes);
app.use("/tokens", tokenRoutes);
app.use("/rtc", rtcRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;

iniciarSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
