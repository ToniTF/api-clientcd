import pool from '../config/database.js'; // Asegúrate de que la ruta sea correcta

class Post {
    constructor(id, title, content, authorId, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static createTableQuery() {
        return `
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                authorId INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
    }

    // Método para crear un nuevo post
    static async create(title, content, authorId) {
        const [result] = await pool.execute(
            'INSERT INTO posts (title, content, authorId) VALUES (?, ?, ?)',
            [title, content, authorId]
        );
        return result.insertId; // Devuelve el ID del post creado
    }

    // Método para obtener todos los posts
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM posts ORDER BY createdAt DESC');
        return rows.map(row => new Post(row.id, row.title, row.content, row.authorId, row.createdAt, row.updatedAt));
    }

    // Método para encontrar un post por su ID, INCLUYENDO información del autor
    static async findById(id) {
        // Modificamos la consulta SQL para unir 'posts' con 'users'
        const sql = `
            SELECT
                p.id,
                p.title,
                p.content,
                p.authorId,
                p.createdAt,
                p.updatedAt,
                u.id AS authorUserId,  -- Renombramos users.id para claridad
                u.email AS authorEmail -- Seleccionamos el email del autor
                -- Puedes añadir u.username AS authorUsername si tienes esa columna
            FROM
                posts p
            LEFT JOIN
                users u ON p.authorId = u.id -- Unimos por el ID del autor
            WHERE
                p.id = ?
        `;
        const params = [id];

        try {
            const [rows] = await pool.execute(sql, params);

            if (rows.length === 0) {
                return null; // No se encontró el post
            }

            // Devolvemos directamente el objeto de la fila, que ahora contiene
            // tanto los datos del post como los del autor.
            // Ya no creamos una instancia de 'new Post()' aquí para mantenerlo simple.
            const postData = rows[0];
            return postData;

        } catch (error) {
            console.error("Error en Post.findById con JOIN:", error);
            throw error; // Relanza para que el controlador lo maneje
        }
    }

    /**
     * Actualiza un post en la base de datos.
     * Solo permite la actualización si el ID del post y el ID del autor coinciden.
     * @param {number|string} id - El ID del post a actualizar.
     * @param {string} title - El nuevo título del post.
     * @param {string} content - El nuevo contenido del post.
     * @param {number|string} userId - El ID del usuario que intenta actualizar (debe ser el autor).
     * @returns {Promise<number>} - Promesa que resuelve con el número de filas afectadas.
     */
    static async updateById(id, title, content, userId) {
        const sql = `
            UPDATE posts
            SET title = ?, content = ?
            WHERE id = ? AND authorId = ?
        `;
        // Los parámetros deben estar en el orden correcto: title, content, id, userId
        const params = [title, content, id, userId];

        try {
            const [result] = await pool.query(sql, params);
            // result.affectedRows contendrá 0 si no se encontró el post con ese ID Y ese authorId,
            // o 1 si la actualización fue exitosa.
            return result.affectedRows;
        } catch (error) {
            console.error("Error en Post.updateById:", error);
            // Relanza el error para que el controlador lo maneje
            throw error;
        }
    }

    /**
     * Elimina un post en la base de datos.
     * Solo permite la eliminación si el ID del post y el ID del autor coinciden.
     * @param {number|string} id - El ID del post a eliminar.
     * @param {number|string} userId - El ID del usuario que intenta eliminar (debe ser el autor).
     * @returns {Promise<number>} - Promesa que resuelve con el número de filas afectadas.
     */
    static async deleteById(id, userId) {
        const sql = `
            DELETE FROM posts
            WHERE id = ? AND authorId = ?
        `;
        const params = [id, userId];

        try {
            const [result] = await pool.query(sql, params);
            return result.affectedRows; // 0 si no se encontró/autorizó, 1 si se borró
        } catch (error) {
            console.error("Error en Post.deleteById:", error);
            throw error;
        }
    }

    // Puedes añadir más métodos aquí (update, delete, findByAuthor, etc.)
}

export default Post;

// Inicializar la tabla si no existe (opcional, puede hacerse en otro lugar)
(async () => {
    try {
        await pool.query(Post.createTableQuery());
        console.log("Tabla 'posts' verificada/creada exitosamente.");
    } catch (error) {
        console.error("Error al crear/verificar la tabla 'posts':", error);
    }
})();