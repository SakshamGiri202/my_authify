import { User, Session, ApiKey } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
      apiKey?: ApiKey;
    }
  }
}
