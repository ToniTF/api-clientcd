import mysql from 'mysql2/promise'; // Usa mysql2/promise
import 'dotenv/config'; // Carga variables de entorno

// Crea un pool de conexiones en lugar de una única conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER, // Asegúrate que DB_USER esté en .env
    password: process.env.DB_PASSWORD, // Asegúrate que DB_PASSWORD esté en .env
    database: process.env.DB_DATABASE, // Usa DB_DATABASE como en tu .env
    port: process.env.DB_PORT || 3306,
    waitForConnections: true, // Espera si todas las conexiones están en uso
    connectionLimit: 10,      // Número máximo de conexiones en el pool
    queueLimit: 0             // Sin límite en la cola de espera
});

// No necesitas pool.connect(), el pool maneja las conexiones automáticamente.
// Puedes añadir un listener para errores del pool si quieres.
pool.on('error', (err) => {
    console.error('Error en el pool de conexiones MySQL:', err);
});

// Exporta el pool para que los modelos puedan usarlo
export default pool;