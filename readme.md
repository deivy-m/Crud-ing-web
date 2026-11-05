# 💈 BarberManager — Administración MVC y Motor de Precios Dinámicos (Core)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![EJS](https://img.shields.io/badge/EJS-7.0.1-yellow)](https://ejs.co/)
[![Architecture](https://img.shields.io/badge/Architecture-MVC%20Classic-orange)](#-arquitectura-mvc)

Aplicación web desarrollada bajo la arquitectura **MVC (Modelo-Vista-Controlador)** con **Node.js, Express, EJS y MongoDB Atlas**. 

Este proyecto implementa el módulo de **Administración** que alimenta el **Core del sistema: Motor de Precios Dinámicos (Dynamic Pricing Engine)** para barberías, cumpliendo con validaciones estrictas de datos sensibles en el servidor y gestión de referencias foráneas mediante selectores dinámicos.

---

## 📹 Video Explicativo (Loom / YouTube)

- **Enlace del Video:** `[COLOCA_AQUÍ_TU_ENLACE_DE_LOOM_O_YOUTUBE]`
- **Duración recomendada:** 4 a 6 minutos.
- **Guión paso a paso para la grabación:** Consulta el archivo [`GUION_VIDEO_ADMIN.md`](./GUION_VIDEO_ADMIN.md).

---

## 🎯 ¿Cómo la Administración Alimenta al Core?

El **Core** del sistema es un **Motor de Precios Dinámicos** que calcula en tiempo real la tarifa de un servicio según:
1. **Precio Base del Servicio:** Definido en el módulo administrativo de **Servicios** (`/services`).
2. **Nivel del Barbero:** Definido en el módulo de **Barberos** (`/barbers`). Un barbero *Junior* cobra tarifa base, un *Senior* tiene recargo del +15% y un *Master Barber* tiene recargo del +30%.
3. **Franja Horaria y Día:** Reglas de horario valle (-15% Lun-Mié mañanas) u horario pico (+20% Vie-Sáb tardes).
4. **Temporada Festiva:** Definida en el módulo de **Temporadas** (`/seasons`), con factores de ajuste (+10% Navidad, etc.).
5. **Reglas de Tarificación:** Centralizadas en **Reglas de Precio** (`/pricing-rules`), donde se configuran los multiplicadores.

> **Fórmula del Core:**  
> $$PrecioFinal = PrecioBase \times (1 + FactorBarbero) \times (1 + FactorHorario) \times (1 + FactorTemporada)$$

---

## 🚨 Requerimientos Clave Cumplidos

### 1. Validación en Back-End de Dato Sensible (Cédula Ecuatoriana)
* **Archivo:** `controllers/barberController.js` (función `validarCedulaEcuatoriana`)
* **Dato Sensible:** **Cédula de Identidad** del barbero.
* **Justificación técnica:** No se confía en validaciones del lado del cliente (JavaScript en navegador). La petición `POST /barbers` es interceptada en el servidor y evaluada con el algoritmo oficial de **módulo 10 del Registro Civil del Ecuador**:
  1. Verifica que tenga exactamente 10 dígitos numéricos.
  2. Valida código de provincia válido (01 a 24, o 30).
  3. Verifica que el tercer dígito sea menor a 6 (persona natural).
  4. Aplica coeficientes `[2, 1, 2, 1, 2, 1, 2, 1, 2]`, suma productos (restando 9 si es $\ge 10$) y compara el residuo con el décimo dígito verificador.
  5. Valida **unicidad** en MongoDB (`Barber.findOne({ cedula })`) antes de persistir.
  6. Si la cédula es falsa, el Back-End rechaza la inserción y retorna el mensaje explicativo en la vista.

### 2. Referencia Foránea mediante Dropdowns (No inputs de texto simple)
* **Archivos:** `views/pricing-rules/create.ejs`, `controllers/pricingRuleController.js`
* **Relación:** `PricingRule` $\rightarrow$ `Season` (Clave foránea `temporada` de tipo `ObjectId`).
* **Implementación:** 
  - Al ingresar una nueva regla de precio, el usuario **no digita manualmente el ID de la temporada**.
  - El controlador consulta las temporadas activas en MongoDB (`Season.find({ activo: true })`) y las inyecta en la vista.
  - La vista renderiza un `<select name="temporada">` con las opciones disponibles mostrando el nombre, fechas y factor de la temporada.
  - Al consultar el listado, Mongoose realiza `.populate('temporada')` para mostrar la información legible en la tabla.

---

## 🏗️ Arquitectura del Proyecto (MVC)

```
barber-manager/
├── config/
│   └── db.js                        # Conexión a MongoDB Atlas con Mongoose
├── controllers/
│   ├── authController.js            # Login, Registro y Logout de administradores
│   ├── barberController.js          # CRUD Barberos + Validación Back-End de Cédula
│   ├── pricingController.js         # Lógica del Core de Precios Dinámicos
│   ├── pricingRuleController.js     # CRUD Reglas de Precio con Dropdown foráneo
│   ├── seasonController.js          # CRUD Temporadas con validación de fechas
│   └── serviceController.js         # CRUD de Servicios de barbería
├── middleware/
│   └── authMiddleware.js            # Protección de rutas privadas por sesión
├── models/
│   ├── Barber.js                    # Esquema: nombre, cédula (sensible), email, categoría
│   ├── PricingRule.js               # Esquema: tipo, factor, ref foránea a Season
│   ├── Season.js                    # Esquema: fechas inicio/fin, factorPrecio
│   ├── Service.js                   # Esquema: nombre, precio base, duración
│   └── User.js                      # Esquema: usuario administrador con bcrypt
├── routes/
│   ├── authRoutes.js                # Rutas públicas /auth
│   ├── barberRoutes.js              # Rutas /barbers (Protegidas)
│   ├── pricingRoutes.js             # Rutas /pricing (Core)
│   ├── pricingRuleRoutes.js         # Rutas /pricing-rules (Protegidas)
│   ├── seasonRoutes.js              # Rutas /seasons (Protegidas)
│   └── serviceRoutes.js             # Rutas /services (Protegidas)
├── views/
│   ├── auth/                        # Vistas de Login y Registro
│   ├── barbers/                     # Vistas CRUD Barberos (index, create, edit)
│   ├── pricing/                     # Vista del Cotizador del Core
│   ├── pricing-rules/               # Vistas CRUD Reglas con dropdown relacional
│   ├── seasons/                     # Vistas CRUD Temporadas
│   ├── services/                    # Vistas CRUD Servicios
│   └── index.ejs                    # Landing page del sistema
├── .env.example                     # Plantilla de variables de entorno
├── Procfile                         # Comando de inicio para despliegue
├── render.yaml                      # Configuración de despliegue en Render
├── package.json
└── app.js                           # Punto de entrada de la aplicación Express
```

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/deivy-m/Crud-ing-web.git
cd Crud-ing-web
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz (puedes basarte en `.env.example`):
```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@clusterbarber.dqimshg.mongodb.net/barber_db
SESSION_SECRET=clave_secreta_super_segura
```

### 4. Iniciar la Aplicación
```bash
# Modo producción / estándar
npm start

# Modo desarrollo con recarga automática
npm run dev
```

La aplicación estará disponible en: **`http://localhost:3000`**

---

## 🌐 Rutas del Sistema

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Landing page principal | Público |
| `/auth/login` | Inicio de sesión | Público |
| `/auth/register` | Registro de administradores | Público |
| `/services` | CRUD de Servicios de Barbería | Protegido (Admin) |
| `/barbers` | CRUD de Barberos (Validación Cédula Back-End) | Protegido (Admin) |
| `/seasons` | CRUD de Temporadas Especiales | Protegido (Admin) |
| `/pricing-rules` | CRUD de Reglas de Precio (Dropdown foráneo) | Protegido (Admin) |
| `/pricing` | Cotizador en Vivo del Core | Público / Demo |

---

## ☁️ Despliegue en la Nube (Render)

1. Conecta tu repositorio de GitHub a [Render.com](https://render.com).
2. Crea un nuevo **Web Service**.
3. Parámetros de configuración:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node app.js`
4. En **Environment Variables**, añade:
   - `MONGO_URI`: Cadena de conexión a MongoDB Atlas.
   - `SESSION_SECRET`: Clave secreta para cookies de sesión.
   - `PORT`: `3000`

---

## 👤 Autor
- **Deivy Molina**
- Estudiante de Ingeniería Web — 7° Semestre
