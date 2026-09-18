require("dotenv").config();

const common = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  dialect: "postgres",
  logging: false,
};

const sslConfig = {
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
};

module.exports = {
  development: { ...common }, // ✅ sin SSL
  test: { ...common }, // ✅ sin SSL
  production: { ...common, ...sslConfig }, // ✅ con SSL
};
