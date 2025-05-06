import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    // Para Render, si te conectas desde un servicio de Render a una DB de Render,
    // SSL puede no ser necesario en el cliente. Si usas la DATABASE_URL de Render,
    // a menudo ya incluye los parámetros SSL.
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.log('Conectado exitosamente a la base de datos PostgreSQL!');
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de la base de datos PostgreSQL', err);
    process.exit(-1); // Salir si hay un error crítico con la DB
});

export default pool;