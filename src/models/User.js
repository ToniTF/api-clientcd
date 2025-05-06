import pool from '../config/database.js'; // Asegúrate que database.js esté configurado para pg
import bcrypt from 'bcryptjs';

const saltRounds = 10;

class User {
    constructor(id, email, password, role, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password; // Contiene el hash
        this.role = role;
        // Asegúrate de que los nombres coincidan con cómo los devuelve la BD (sensible a mayúsculas/minúsculas con pg)
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async create(email, plainPassword) {
        try {
            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            const defaultRole = 'user';
            // Usar $1, $2, ... para placeholders y RETURNING id para obtener el ID insertado
            const sql = 'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id';
            const params = [email, hashedPassword, defaultRole];
            const result = await pool.query(sql, params); // Usar pool.query()
            if (result.rows.length > 0) {
                return result.rows[0].id; // Obtener el ID de la fila devuelta
            }
            throw new Error("No se pudo crear el usuario o obtener el ID.");
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    static async findByEmail(email) {
        // Usar $1 para placeholder. Usar comillas dobles para nombres de columna si son sensibles a mayúsculas/minúsculas
        // o si coinciden con palabras reservadas de SQL (ej. "user", "role" si fueran problemáticos).
        // Para createdAt y updatedAt, si las definiste como "createdAt" en la tabla, usa row["createdAt"].
        const sql = 'SELECT id, email, password, role, "createdAt", "updatedAt" FROM users WHERE email = $1';
        const params = [email];
        try {
            const result = await pool.query(sql, params); // Usar pool.query()
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new User(row.id, row.email, row.password, row.role, row["createdAt"], row["updatedAt"]);
        } catch (error) {
            console.error("Error en User.findByEmail:", error);
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT id, email, role, "createdAt", "updatedAt" FROM users WHERE id = $1';
        const params = [id];
        try {
            const result = await pool.query(sql, params); // Usar pool.query()
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            // Omitiendo password hash ya que generalmente no se necesita al buscar por ID para mostrar info
            return new User(row.id, row.email, null, row.role, row["createdAt"], row["updatedAt"]);
        } catch (error) {
            console.error("Error en User.findById:", error);
            throw error;
        }
    }

    async comparePassword(plainPassword) {
        if (!this.password) {
            // Esto puede ocurrir si la contraseña no se seleccionó en la consulta (ej. en findById)
            console.warn("Intento de comparar contraseña cuando el hash no está cargado para el usuario:", this.email);
            // Podrías lanzar un error o recargar el usuario con la contraseña si es necesario
            return false;
        }
        return await bcrypt.compare(plainPassword, this.password);
    }
}

export default User;

// --- ¡¡¡IMPORTANTE!!! ---
// EL SIGUIENTE BLOQUE DE INICIALIZACIÓN DE TABLA HA SIDO ELIMINADO.
// Las tablas deben crearse manualmente con el script SQL de PostgreSQL que ejecutaste en pgAdmin.
/*
(async () => {
    try {
        // await pool.query(User.createTableQuery()); // ESTO USABA SINTAXIS MYSQL
        // console.log("Tabla 'users' verificada/creada exitosamente.");
    } catch (error) {
        // console.error("Error al crear/verificar la tabla 'users':", error);
    }
})();
*/