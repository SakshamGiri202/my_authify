import { PgTable, text,  timestamp, boolean, uuid, index, pgTable, isPgMaterializedView } from "drizzle-orm/pg-core";

export const user = pgTable('user',{
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('mail').notNull().unique(),
    passwordHash: text('password_hash'),
    emailVerified: boolean('email_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid("userid").notNull().references(()=> user.id, {onDelete: 'cascade'}),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expired_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),

}, (table)=> [
    index('session_token_idx').on(table.token)
])