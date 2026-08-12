import {drizzle} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import *  as schema from "./schema";

import "dotenv/config";

if(!process.env.DATABASE_URL{
    throw new Error("DATABASE_URL enviroment string is missing"); 
}

const pool = new pg({
    connectString: process.env.DATABASE_URL,
})

export const db = drizzle({pool, {schema}});