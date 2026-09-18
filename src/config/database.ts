import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
} = process.env;

if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_HOST) {
  throw new Error("Faltan variables de entorno para configurar Sequelize");
}

const isProd = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT || 5432),
    dialect: "postgres",
    logging: false,
    dialectOptions: isProd
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}, // ✅ local sin SSL
  }
);

export default sequelize;
