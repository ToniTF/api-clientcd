import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const saltRounds = 10; // Cost factor for bcrypt hashing

class User {
    constructor(id, email, password, role, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password; // Note: This will store the hashed password
        this.role = role; // Store the role
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static createTableQuery() {
        return `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
    }

    // Método para crear un nuevo usuario (hasheando la contraseña)
    static async create(email, plainPassword) {
        try {
            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            const defaultRole = 'user'; // Definir el rol por defecto
            const [result] = await pool.execute(
                // Añadir 'role' a la consulta y a los parámetros
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [email, hashedPassword, defaultRole] // Pasar el rol
            );
            return result.insertId; // Devuelve el ID del usuario creado
        } catch (error) {
            // Manejar errores, por ejemplo, si el email ya existe (error de clave única)
            console.error("Error creating user:", error);
            throw error; // Re-lanzar el error para que el controlador lo maneje
        }
    }

    // Método para encontrar un usuario por su email
    static async findByEmail(email) {
        const sql = 'SELECT id, email, password, role, createdAt, updatedAt FROM users WHERE email = ?';
        const params = [email];
        try {
            const [rows] = await pool.execute(sql, params);
            if (rows.length === 0) {
                return null; // No se encontró el usuario
            }
            const row = rows[0];
            // Devolvemos una instancia de User con los datos, incluyendo el hash de la contraseña y el rol
            return new User(row.id, row.email, row.password, row.role, row.createdAt, row.updatedAt);
        } catch (error) {
            console.error("Error en User.findByEmail:", error);
            throw error;
        }
    }

    // Método para encontrar un usuario por su ID
    static async findById(id) {
        const sql = 'SELECT id, email, role, createdAt, updatedAt FROM users WHERE id = ?';
        const params = [id];
        try {
            const [rows] = await pool.execute(sql, params);
            if (rows.length === 0) {
                return null; // No se encontró el usuario
            }
            const row = rows[0];
            // Devolvemos una instancia de User, usualmente no necesitamos la contraseña aquí
            return new User(row.id, row.email, null, row.role, row.createdAt, row.updatedAt); // Omitiendo password hash
        } catch (error) {
            console.error("Error en User.findById:", error);
            throw error;
        }
    }

    // Método de instancia para comparar contraseñas
    async comparePassword(plainPassword) {
        return await bcrypt.compare(plainPassword, this.password);
    }

    // Puedes añadir más métodos aquí (update, delete, etc.)
}

export default User;

// Inicializar la tabla si no existe (opcional)
(async () => {
    try {
        await pool.query(User.createTableQuery());
        console.log("Tabla 'users' verificada/creada exitosamente.");
    } catch (error) {
        console.error("Error al crear/verificar la tabla 'users':", error);
    }
})();