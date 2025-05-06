import express from 'express';
import 'dotenv/config'; // Carga variables de entorno desde .env al inicio
import cors from 'cors'; // Importa cors

// Importar Rutas
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

// Importar la configuración de la base de datos (opcional, si necesitas inicializar algo aquí)
// import pool from './config/database.js'; // Ya se usa en los modelos

// Crear la aplicación Express
const app = express();

// Lista de orígenes permitidos
const allowedOrigins = [
    'http://localhost:3000',       // Para desarrollo local directo
    'http://192.168.56.1:3000',     // Para acceso desde la IP específica
    'https://tonitf.github.io'       // Añadido para permitir GitHub Pages
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como Postman, curl, o apps móviles) O si el origen está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true // Permite enviar cookies/tokens de autorización
}));
app.use(express.json()); // Para parsear bodies de requests JSON

// Rutas de la API
app.use('/api/auth', authRoutes); // Monta las rutas de autenticación bajo /api/auth
app.use('/api/posts', postRoutes); // Monta las rutas de posts bajo /api/posts

// Ruta de bienvenida (opcional)
app.get('/', (req, res) => {
    res.send('Bienvenido a la API Node.js con MySQL!');
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Middleware básico para manejo de errores (opcional pero recomendado)
// Este se ejecutará si algún middleware anterior llama a next(error)
app.use((err, req, res, next) => {
    console.error("Error no manejado:", err.stack);
    res.status(500).json({ message: 'Error interno del servidor.' });
});

// Puerto del servidor
const PORT = process.env.PORT || 5000; // Usa el puerto de .env o 3000 por defecto

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // Opcional: Verificar conexión a la base de datos al iniciar
    // pool.query('SELECT 1')
    //    .then(() => console.log('Conexión a la base de datos establecida.'))
    //    .catch(err => console.error('Error al conectar a la base de datos:', err));
});

// Exportar app (útil para pruebas)
export default app;