import { drizzle } from "drizzle-orm/neon-http";
import {eq  } from "drizzle-orm";
import { usersTable } from "./db/schema.ts";

import  "dotenv/config";


const db = drizzle(process.env.DATABASE_URL);


async function main(params:type) {
   const user: typeof userTable.$inferinsert ={
    name: "saksham",
    age: 22,
    email:"test@gmail.com",
  };

await db.insert(usersTable).values(user);
console.log("new user created!");

  const users = await db.select().from(usersTable);
  console.log("getting all user from the database:", user);
  
  await db
  .update(usersTable)
  .set({
    age:24
  })
  .where(eq(usersTable.email, user.email));

  console.log("user info update");
  
await db.delete(usersTable)
.where(eq(usersTable.email, user.email));

}


main();
