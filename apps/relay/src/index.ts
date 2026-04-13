import Fastify from "fastify";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { signaling } from "./signaling";

const PORT = parseInt(process.env.PORT || "4000", 10);

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.get("/health", async () => ({ status: "ok", service: "oto-relay" }));

  await signaling(app);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`OTO Relay running on :${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
