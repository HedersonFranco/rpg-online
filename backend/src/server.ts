import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { usuarioRoutes } from "./modules/usuario/usuario.routes.js";
import { salaRoutes } from "./modules/sala/sala.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", usuarioRoutes);
app.use("/salas", salaRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});