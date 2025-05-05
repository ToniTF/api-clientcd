import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const saltRounds = 10; // Cost factor for bcrypt hashing

class User {
    constructor(id, email, password, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password; // Note: This will store the hashed password
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static createTableQuery() {
        return `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
    }

    // Método para crear un nuevo usuario (hasheando la contraseña)
    static async create(email, plainPassword) {
        try {
            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            const [result] = await pool.execute(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword]
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
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return null; // No se encontró el usuario
        }
        const row = rows[0];
        // Devolvemos una instancia de User con los datos, incluyendo el hash de la contraseña
        return new User(row.id, row.email, row.password, row.createdAt, row.updatedAt);
    }

    // Método para encontrar un usuario por su ID
    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null; // No se encontró el usuario
        }
        const row = rows[0];
        // Devolvemos una instancia de User, usualmente no necesitamos la contraseña aquí
        // Podríamos omitirla o devolver un objeto plano si es necesario
        return new User(row.id, row.email, null, row.createdAt, row.updatedAt); // Omitiendo password hash
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