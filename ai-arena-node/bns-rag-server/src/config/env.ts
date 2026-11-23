import dotenv from "dotenv";
import { z } from "zod";

import CONSTANTS from "../constants.js";

dotenv.config()

const {PORT, OPENAI_CHAT_MODEL, EMBEDDING_MODEL} = CONSTANTS

const envSchema = z.object({
  PORT: z.string().default(PORT),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_MODEL is required"),
  EMBEDDING_MODEL: z.string().default(EMBEDDING_MODEL),
  CHAT_MODEL: z.string().default(OPENAI_CHAT_MODEL),
  DATABASE_URL: z.url("DATABASE_URL must be a valid Postgres URL"),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1)
}

export const env = parsed.data;