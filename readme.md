BarberManager - Sistema de Gestión para Barberías

Aplicación web desarrollada bajo la arquitectura MV utilizando Node.js, Express y MongoDB. El proyecto incluye autenticación de usuarios con contraseñas encriptadas, protección de rutas mediante sesiones y un módulo CRUD para la administración de servicios.

Tecnologías Utilizadas

-Entorno de ejecución:  Node.js
-Framework Web: Express.js
-Base de Datos: MongoDB Atlas
-Seguridad y Sesiones: Bcryptjs, Express-Session, Dotenv


Estructura del Proyecto (MVC)

barber-manager/
├── config/
│   └── db.js                 # Conexión a la base de datos MongoDB Atlas
├── controllers/
│   ├── authController.js     # Lógica de registro, login y logout
│   └── serviceController.js  # Lógica de operaciones CRUD de servicios
├── middleware/
│   └── authMiddleware.js     # Middleware de protección de rutas
├── models/
│   ├── User.js               # Esquema de usuario y hash bcrypt
│   └── Service.js            # Esquema del servicio de barbería
├── routes/
│   ├── authRoutes.js         # Rutas públicas de autenticación
│   └── serviceRoutes.js      # Rutas privadas del CRUD
├── views/
│   ├── auth/                 # Formulario de Login y Registro
│   ├── services/             # Vistas de gestión de servicios (CRUD)
│   └── index.ejs             # Página principal de bienvenida
├── .env                      # Variables de entorno
├── .gitignore                # Archivos excluidos del repositorio
├── app.js                    # Servidor principal Express
└── package.json              # Configuración de dependencias y scripts

Link video:
https://youtu.be/2RsLJKEumCk

