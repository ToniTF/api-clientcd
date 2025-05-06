import pool from '../config/database.js'; // Asegúrate que database.js esté configurado para pg

class Post {
    constructor(id, title, content, authorId, createdAt, updatedAt, authorEmail = null) { // authorEmail es opcional
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId; // En PostgreSQL, el nombre de columna es "authorId"
        this.createdAt = createdAt; // En PostgreSQL, el nombre de columna es "createdAt"
        this.updatedAt = updatedAt; // En PostgreSQL, el nombre de columna es "updatedAt"
        if (authorEmail) {
            this.authorEmail = authorEmail; // Para cuando hacemos JOIN en findById
        }
    }

    static async create({ title, content, authorId }) {
        // Usar comillas dobles para "authorId" si así se definió en la tabla de PostgreSQL
        const sql = 'INSERT INTO posts (title, content, "authorId") VALUES ($1, $2, $3) RETURNING id, title, content, "authorId", "createdAt", "updatedAt"';
        const params = [title, content, authorId];
        try {
            const result = await pool.query(sql, params);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return new Post(row.id, row.title, row.content, row["authorId"], row["createdAt"], row["updatedAt"]);
            }
            throw new Error("No se pudo crear el post.");
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    }

    static async findAll() {
        // Usar comillas dobles para los nombres de columna si se definieron así en la tabla
        const sql = 'SELECT id, title, content, "authorId", "createdAt", "updatedAt" FROM posts ORDER BY "createdAt" DESC';
        try {
            const result = await pool.query(sql);
            return result.rows.map(row => new Post(row.id, row.title, row.content, row["authorId"], row["createdAt"], row["updatedAt"]));
        } catch (error) {
            console.error("Error finding all posts:", error);
            throw error;
        }
    }

    static async findById(id) {
        const sql = `
            SELECT
                p.id,
                p.title,
                p.content,
                p."authorId",
                p."createdAt",
                p."updatedAt",
                u.email AS "authorEmail"
            FROM
                posts p
            LEFT JOIN
                users u ON p."authorId" = u.id
            WHERE
                p.id = $1
        `;
        const params = [id];
        try {
            const result = await pool.query(sql, params);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            // Creamos una instancia de Post, pasando el email del autor
            return new Post(row.id, row.title, row.content, row["authorId"], row["createdAt"], row["updatedAt"], row["authorEmail"]);
        } catch (error) {
            console.error("Error en Post.findById con JOIN:", error);
            throw error;
        }
    }

    static async updateById(id, { title, content, userId }) { // userId para verificar autorización
        // "updatedAt" se actualizará automáticamente por el trigger en PostgreSQL
        // Asegurarse que el userId coincida con el authorId del post
        const sql = 'UPDATE posts SET title = $1, content = $2 WHERE id = $3 AND "authorId" = $4 RETURNING id, title, content, "authorId", "createdAt", "updatedAt"';
        const params = [title, content, id, userId];
        try {
            const result = await pool.query(sql, params);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return new Post(row.id, row.title, row.content, row["authorId"], row["createdAt"], row["updatedAt"]);
            }
            // Si no se devuelve ninguna fila, significa que el post no existía o el usuario no era el autor
            return null;
        } catch (error) {
            console.error("Error updating post by ID:", error);
            throw error;
        }
    }

    static async deleteById(id, userId) { // userId para verificar autorización
        // Asegurarse que el userId coincida con el authorId del post
        const sql = 'DELETE FROM posts WHERE id = $1 AND "authorId" = $2 RETURNING id';
        const params = [id, userId];
        try {
            const result = await pool.query(sql, params);
            return result.rowCount > 0; // Devuelve true si se eliminó una fila (rowCount > 0)
        } catch (error) {
            console.error("Error deleting post by ID:", error);
            throw error;
        }
    }

    // Si tienes métodos para buscar posts por autorId
    static async findByAuthorId(authorId) {
        const sql = 'SELECT id, title, content, "authorId", "createdAt", "updatedAt" FROM posts WHERE "authorId" = $1 ORDER BY "createdAt" DESC';
        const params = [authorId];
        try {
            const result = await pool.query(sql, params);
            return result.rows.map(row => new Post(row.id, row.title, row.content, row["authorId"], row["createdAt"], row["updatedAt"]));
        } catch (error) {
            console.error("Error finding posts by author ID:", error);
            throw error;
        }
    }
}

export default Post;

// --- ¡¡¡IMPORTANTE!!! ---
// EL SIGUIENTE BLOQUE DE INICIALIZACIÓN DE TABLA HA SIDO ELIMINADO.
// Las tablas deben crearse manualmente con el script SQL de PostgreSQL que ejecutaste en pgAdmin.
/*
(async () => {
    try {
        // await pool.query(Post.createTableQuery()); // ESTO USABA SINTAXIS MYSQL
        // console.log("Tabla 'posts' verificada/creada exitosamente.");
    } catch (error) {
        // console.error("Error al crear/verificar la tabla 'posts':", error);
    }
})();
*/