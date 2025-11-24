function getEnv(key: string, fallback?: string) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  PORT: Number(getEnv("PORT", "4000")),
  DB_URL: getEnv("DB_URL", "postgres://game:secret@localhost:5432/game"),
  REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),
  JWT_SECRET: getEnv("JWT_SECRET", "dev-secret"),
  DEV_SKIP_AUTH: getEnv("DEV_SKIP_AUTH", "true") === "true",
};
