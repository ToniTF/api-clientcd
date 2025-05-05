import express from 'express';
// Añade deletePost a la importación
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from '../controllers/postController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para crear un nuevo post (protegida por autenticación)
// POST /api/posts
router.post('/', authMiddleware, createPost); // Aplica el middleware aquí

// Ruta para obtener todos los posts (pública)
// GET /api/posts
router.get('/', getAllPosts);

// Ruta para obtener un post por su ID (pública)
// GET /api/posts/:id
router.get('/:id', getPostById);

// Puedes añadir rutas para actualizar y eliminar posts aquí, también protegidas
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost); // Ahora deletePost está definido

export default router;