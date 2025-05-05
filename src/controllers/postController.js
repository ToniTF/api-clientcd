import Post from '../models/Post.js';

// Controlador para crear un nuevo post
export const createPost = async (req, res) => {
    const { title, content } = req.body;
    // El ID del autor se obtiene del middleware de autenticación (authMiddleware)
    // que lo añade al objeto `req` (ej: req.userId)
    const authorId = req.userId;

    if (!title || !content) {
        return res.status(400).json({ message: 'Título y contenido son requeridos.' });
    }

    if (!authorId) {
         // Esto no debería ocurrir si el middleware se aplica correctamente
        console.error("Error: authorId no encontrado en la solicitud. Asegúrate de que el middleware de autenticación se esté ejecutando antes de esta ruta.");
        return res.status(401).json({ message: 'No autorizado para crear un post.' });
    }

    try {
        const postId = await Post.create(title, content, authorId);
        res.status(201).json({ message: 'Post creado exitosamente.', postId });
    } catch (error) {
        console.error("Error al crear el post:", error);
        // Podrías verificar errores específicos, como una clave foránea inválida si el authorId no existe en users
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ message: 'El autor especificado no existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el post.' });
    }
};

// Controlador para obtener todos los posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error al obtener los posts:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los posts.' });
    }
};

// Controlador para obtener un post por su ID
export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        // Llama al método findById modificado
        const post = await Post.findById(id); // Ahora 'post' contendrá la info del autor

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado.' });
        }
        // Envía el objeto 'post' completo (con datos del autor) como JSON
        res.status(200).json(post);
    } catch (error) {
        console.error(`Error al obtener el post con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el post.' });
    }
};

// Controlador para actualizar un post existente
export const updatePost = async (req, res) => {
    const { id } = req.params; // ID del post a actualizar
    const { title, content } = req.body; // Nuevos datos del post
    const userId = req.userId; // ID del usuario que realiza la solicitud (del middleware)

    // Validación básica de entrada
    if (!title || !content) {
        return res.status(400).json({ message: 'Título y contenido son requeridos.' });
    }

    if (!userId) {
        // Seguridad extra, aunque el middleware debería prevenir esto
        return res.status(401).json({ message: 'No autorizado.' });
    }

    try {
        // Llama al método del modelo para actualizar, pasando el ID del post,
        // los nuevos datos y el ID del usuario para verificar la autoría.
        const affectedRows = await Post.updateById(id, title, content, userId);

        // Verifica si la actualización afectó alguna fila
        if (affectedRows === 0) {
            // Si no afectó filas, puede ser porque el post no existe O
            // porque el usuario no es el autor. Por seguridad, damos un 404 genérico.
            // Podríamos hacer una consulta previa para dar un 403 si el post existe pero el autor no coincide,
            // pero eso revela información. 404 es más seguro en este caso.
            return res.status(404).json({ message: 'Post no encontrado o no autorizado para modificar.' });
        }

        // Si la actualización fue exitosa (affectedRows > 0)
        res.status(200).json({ message: 'Post actualizado exitosamente.' });
        // Opcionalmente, podrías devolver el post actualizado haciendo otra consulta findById(id)

    } catch (error) {
        console.error(`Error al actualizar el post con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el post.' });
    }
};

// Controlador para eliminar un post
export const deletePost = async (req, res) => {
    const { id } = req.params; // ID del post a borrar
    const userId = req.userId; // ID del usuario que realiza la solicitud

    if (!userId) {
        return res.status(401).json({ message: 'No autorizado.' });
    }

    try {
        const affectedRows = await Post.deleteById(id, userId);

        if (affectedRows === 0) {
            // Post no encontrado o usuario no autorizado
            return res.status(404).json({ message: 'Post no encontrado o no autorizado para eliminar.' });
        }

        res.status(200).json({ message: 'Post eliminado exitosamente.' }); // O 204 No Content

    } catch (error) {
        console.error(`Error al eliminar el post con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el post.' });
    }
};