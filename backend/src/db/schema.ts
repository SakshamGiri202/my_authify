import { PgTable, text,  timestamp, boolean, uuid, index, pgTable, isPgMaterializedView } from "drizzle-orm/pg-core";


// 1 user table
export const user = pgTable('user',{
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('mail').notNull().unique(),
    passwordHash: text('password_hash'),
    emailVerified: boolean('email_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// 2. session table
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


// 3. account table (for oauth provider)

export const account = pgTable('account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(()=> user.id, { onDelete: 'cascade'}),
  providerId: text('provider_id').notNull(), 
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiredAt: timestamp('expired_at'),
}, (table)=> [
  index('provider_idx').on(table.providerId, table.providerAccountId)
]);

// 4. verification table for email verif. and password reset

export const verification = pgTable('verification', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expiredAt: timestamp('expired_at').notNull(),
  type: text('type').$type<'email_verify' | 'password_reset'>().notNull(),
}, (table)=>[
  index('token_idx').on(table.token)
])



export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(()=> user.id, {onDelete: 'cascade'}),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
