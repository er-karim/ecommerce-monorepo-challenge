export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://localhost:5432/inventory",
};
