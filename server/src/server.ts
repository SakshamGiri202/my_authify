import app from "./index.js";
import { prisma } from "./db/client.js";
import "dotenv/config";

const PORT = parseInt(process.env.PORT || "5000", 10);

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("[Database]: Connected successfully to PostgreSQL via Prisma ORM.");

    const server = app.listen(PORT, () => {
      console.log(`[MyAuthify Server]: Listening on http://localhost:${PORT}`);
      console.log(`[Health Endpoint]: http://localhost:${PORT}/api/v1/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[MyAuthify Server]: Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("[MyAuthify Server]: Server closed and database disconnected.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[MyAuthify Server]: Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
