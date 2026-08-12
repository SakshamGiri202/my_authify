import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {session, sessions, user} from "../db/schema.js"

import crypto from "crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;


// 1. create session method
async function createSession(userId: string, req: { ip?:string, userAgent?:string}){
    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = await bcrypt.hash(rawToken, SALT_ROUNDS);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    const [sessionRecord] = await db.insert(sessions).values({
        userId,
        tokenHash,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.userAgent,
    }).returning();

    return {
        sessionId: sessionRecord?.id,
        rawToken,
    };
}



// 2. validate session method
async function validateSession(sessionId: string, rawToken: string) {
    
    const result:any = await db.select({session:sessions, user:user})
    .from(sessions)
    .innerJoin(user, eq(sessions.userId, user.id))
    .where(eq(sessions.id, sessionId));


    if ( result.length === 0){
        return { session:null, user:null};
    }

    const { session, user} = result[0];

    if(Date.now() >= session.expiresAt.getTime()){
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return { session: null, user: null};
    }

    const isTokenValid = await bcrypt.compare(rawToken, session.tokenHash);
    if(!isTokenValid){
        return { session: null, user:null}
    }

    return { session, user};
}

// 3. revoke session method

async function revokeSession(sessionId:string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// 4. revoke  all user session method 
async function revokeAllUserSessions(userId:string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
}




