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
        // 1. Buscar al usuario por email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Email no encontrado
        }

        // 2. Comparar la contraseña proporcionada con la hasheada en la BD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Contraseña incorrecta
        }

        // 3. Si las credenciales son correctas, generar el token JWT
        const payload = { userId: user.id }; // Incluye el ID del usuario en el payload
        const secret = process.env.JWT_SECRET;
        const options = { expiresIn: '1h' }; // El token expira en 1 hora

        const token = jwt.sign(payload, secret, options);

        // 4. Enviar la respuesta con el token Y los datos del usuario
        res.status(200).json({
            message: 'Login exitoso.',
            token: token,
            user: { // <-- Incluir objeto user
                id: user.id,
                email: user.email
                // Puedes añadir otros campos seguros si los necesitas en el frontend
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};