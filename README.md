# Mi API Node MySQL

Este proyecto es una API construida con Node.js y MySQL que permite la gestión de usuarios y publicaciones. A continuación se describen las funcionalidades principales y cómo configurar y ejecutar el proyecto.

## Funcionalidades

- **Autenticación de Usuarios**
  - Registro de nuevos usuarios.
  - Inicio de sesión para usuarios existentes.

- **Gestión de Publicaciones**
  - Publicar nuevas publicaciones.
  - Leer publicaciones existentes.
  - Buscar publicaciones por ID.

## Estructura del Proyecto

```
mi-api-node-mysql
├── src
│   ├── app.js                # Punto de entrada de la aplicación
│   ├── config
│   │   └── database.js       # Configuración de la base de datos MySQL
│   ├── controllers
│   │   ├── authController.js  # Controlador para autenticación
│   │   └── postController.js  # Controlador para publicaciones
│   ├── middleware
│   │   └── authMiddleware.js  # Middleware para autenticación
│   ├── models
│   │   ├── User.js           # Modelo de usuario
│   │   └── Post.js           # Modelo de publicación
│   └── routes
│       ├── authRoutes.js     # Rutas de autenticación
│       └── postRoutes.js     # Rutas de publicaciones
├── .env                       # Variables de entorno
├── package.json               # Configuración de npm
└── README.md                  # Documentación del proyecto
```

## Requisitos

- Node.js
- MySQL

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd mi-api-node-mysql
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno en el archivo `.env`:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=tu_base_de_datos
   ```

## Ejecución

Para iniciar la API, ejecuta el siguiente comando:
```
node src/app.js
```

La API estará disponible en `http://localhost:3000`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.