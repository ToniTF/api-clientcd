import jwt from 'jsonwebtoken'; // Cambiado de require a import
import 'dotenv/config'; // Asegúrate de cargar dotenv si usas process.env aquí

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado: Token no proporcionado o mal formado.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId; // Añade userId a la request
        next(); // Llama a next() SOLO si el token es válido
    } catch (error) {
        console.error('JWT Verification Error:', error.message); // Loguea el error específico
        // NO llames a next() si hay error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'No autorizado: Token expirado.' });
        }
        return res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
};

export default authMiddleware;