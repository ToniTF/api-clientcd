import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Para cargar variables de entorno (asegúrate de tener JWT_SECRET en .env)

export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' }); // 409 Conflict
        }

        // Crear el nuevo usuario
        const userId = await User.create(email, password);

        // Opcional: Podrías generar un token aquí también o simplemente confirmar el registro
        res.status(201).json({ message: 'Usuario registrado exitosamente.', userId });

    } catch (error) {
        console.error("Error en el registro:", error);
        // Comprobar si el error es por clave única (email duplicado) aunque ya lo verificamos antes
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El email ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        // 1. Buscar al usuario por email (asegúrate que findByEmail devuelva el rol)
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Generar el token JWT
        const payload = { userId: user.id, role: user.role }; // <-- Opcional: Añadir rol al payload del token
        const secret = process.env.JWT_SECRET;
        const options = { expiresIn: '1h' };

        const token = jwt.sign(payload, secret, options);

        // 4. Enviar la respuesta con token y datos del usuario (incluyendo el rol)
        res.status(200).json({
            message: 'Login exitoso.',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role // <-- AÑADIR EL ROL AQUÍ
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};