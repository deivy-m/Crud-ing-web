# 🎬 Guion de Video Explicativo: Módulo de Administración MVC (BarberManager)

> **Duración estimada:** 4 a 6 minutos  
> **Plataforma recomendada:** Loom o YouTube  
> **Tema:** Explicación de la administración MVC que alimenta el Core de Precios Dinámicos, validación en Back-End de dato sensible (Cédula) y referencia foránea mediante dropdowns.

---

## ⏱️ Estructura del Video (Timeline)

| Minuto | Sección | Lo que muestras en pantalla |
|---|---|---|
| **0:00 - 0:40** | 1. Introducción y Arquitectura General | Navegador en `http://localhost:3000` y VS Code con la estructura MVC |
| **0:40 - 1:40** | 2. Cómo la Administración alimenta al Core | Explicación de los 4 módulos: Servicios, Barberos, Temporadas y Reglas |
| **1:40 - 3:00** | 3. Demostración de Validación Back-End (Cédula) | Formulario de Barbero: ingresar cédula falsa (error del servidor) y luego cédula válida |
| **3:00 - 4:15** | 4. Demostración de Referencia Foránea (Dropdown) | Formulario de Regla de Precio: mostrar el dropdown que carga las temporadas de MongoDB |
| **4:15 - 5:15** | 5. Demostración del Core en Vivo | Probar el cotizador (`/pricing`) calculando el precio final con los datos administrados |
| **5:15 - 5:45** | 6. Código y Cierre | Mostrar `barberController.js` y `pricingRuleController.js` en VS Code |

---

## 🎙️ Guion Paso a Paso (Qué decir y qué hacer)

---

### Paso 1: Introducción (0:00 - 0:40)
* **En pantalla:** Navegador en `http://localhost:3000` (Página de inicio de BarberManager).
* **Qué dices:**
> "Buenas tardes profesor y compañeros. En este video voy a explicar el desarrollo de la **Administración MVC** para nuestro proyecto **BarberManager**, la cual está diseñada específicamente para alimentar nuestro Core aprobado: el **Motor de Precios Dinámicos** para barberías.
> 
> La aplicación está construida con **Node.js, Express, EJS** para el renderizado del lado del servidor y **MongoDB Atlas** como base de datos en la nube. Todo el código sigue una estricta separación de responsabilidades bajo el patrón Modelo-Vista-Controlador."

---

### Paso 2: Cómo la Administración alimenta al Core (0:40 - 1:40)
* **En pantalla:** Inicia sesión con tus credenciales y navega por el menú superior (`/services`, `/barbers`, `/seasons`, `/pricing-rules`).
* **Qué dices:**
> "Para que nuestro Core matemático pueda calcular tarifas dinámicas en tiempo real, necesita alimentarse de cuatro entidades clave que administramos desde este panel:
> 
> 1. **Servicios (`/services`):** Aquí administramos los cortes y tratamientos con su **precio base** y duración.
> 2. **Barberos (`/barbers`):** Registramos a los profesionales y les asignamos una categoría: *Junior*, *Senior* (+15%) o *Master* (+30%), lo cual altera la tarifa en el Core.
> 3. **Temporadas (`/seasons`):** Períodos del año como Navidad o Vacaciones que aplican recargos o promociones por fecha.
> 4. **Reglas de Precio (`/pricing-rules`):** Donde configuramos las franjas horarias valle y pico, así como las temporadas activas."

---

### Paso 3: Requisito 1 — Validación en Back-End de Dato Sensible (1:40 - 3:00)
* **En pantalla:** Ve a `/barbers/new` (Formulario de Registrar Barbero).
* **Qué dices:**
> "Ahora pasamos al primer requerimiento obligatorio: **la validación en Back-End de un dato sensible**.
> 
> En nuestro sistema, la **Cédula de Identidad** de los barberos es un dato sensible y crítico para contratación y facturación. Esta validación **NO se hace únicamente con JavaScript en el navegador**, sino que se procesa estrictamente en el servidor en `barberController.js`.
> 
> Implementamos el algoritmo oficial del **Registro Civil ecuatoriano (módulo 10)**. Vamos a comprobarlo:
> 
> 1. Primero voy a ingresar un barbero con una **cédula falsa** como `1234567890`.
> 2. Al hacer clic en Guardar, la petición llega a Node.js, el controlador ejecuta la función `validarCedulaEcuatoriana()` y **rechaza la petición en el servidor**, mostrando en pantalla el mensaje de error: *'🚨 La cédula no es válida según el algoritmo de verificación del Registro Civil ecuatoriano'*.
> 3. Ahora voy a ingresar una cédula ecuatoriana real y válida, por ejemplo `1710034065`, con categoría *Master*.
> 4. Como vemos, el servidor la valida con éxito y la guarda en MongoDB Atlas."

---

### Paso 4: Requisito 2 — Referencia Foránea con Dropdown (3:00 - 4:15)
* **En pantalla:** Ve a `/pricing-rules/new` (Crear Regla de Precio).
* **Qué dices:**
> "El segundo requerimiento importante es el manejo de **referencias a otras tablas sin usar inputs simples**.
> 
> Cuando una regla de precio es de tipo *'Temporada'*, necesita vincularse con un registro de la colección `Seasons`. Como exige la rúbrica, **el usuario jamás ingresa el ObjectId o clave foránea manualmente en un input de texto**.
> 
> En su lugar:
> - El controlador consulta las temporadas activas en MongoDB con `Season.find({ activo: true })`.
> - La vista renderiza este **Dropdown relacional (`<select name="temporada">`)** que lista dinámicamente las temporadas disponibles con su nombre, fechas y factor.
> - Al guardar, en `pricingRuleController.js` se asocia la referencia foránea y en la tabla del listado usamos `populate('temporada')` para mostrar el nombre de la temporada y no un código extraño."

---

### Paso 5: Demostración del Core en Vivo (4:15 - 5:15)
* **En pantalla:** Haz clic en `⚡ Probar Cotizador (Core)` en el menú (`/pricing`).
* **Qué dices:**
> "Para demostrar que toda la administración efectivamente alimenta al Core, hemos integrado esta pantalla del cotizador:
> 
> - Selecciono el servicio: *Corte Fade* (Precio base: \$12.00).
> - Selecciono al barbero que acabamos de registrar: *Carlos Ramírez (Master)*.
> - Elijo una fecha en viernes por la tarde (16:00), que cae en *Hora Pico*.
> - Hacemos clic en **'Calcular Precio Dinámico'**.
> 
> El Core ejecuta la fórmula multiplicando el precio base por el factor del barbero (+30%), el factor de hora pico (+20%) y la temporada si aplica, arrojando el precio final con el desglose transparente de cada regla. Si cambiamos el barbero a Junior o la hora a la mañana, el precio cambia automáticamente."

---

### Paso 6: Código en VS Code y Cierre (5:15 - 5:45)
* **En pantalla:** Abre VS Code mostrando `controllers/barberController.js` (la función del módulo 10) y `render.yaml`.
* **Qué dices:**
> "Aquí en el código podemos ver en `controllers/barberController.js` las líneas exactas del algoritmo módulo 10 donde se validan los 10 dígitos, la provincia, el tercer dígito y la suma ponderada.
> 
> El proyecto está versionado en Git con su respectivo `README.md` detallado y listo para desplegar en Render mediante el archivo `render.yaml` y su conexión a MongoDB Atlas.
> 
> Muchas gracias por su atención."

---

## 💡 Consejos Finales para la Grabación
1. **Ten abierta la página en `http://localhost:3000`** ya con sesión iniciada para no perder tiempo escribiendo contraseñas.
2. **Cédulas válidas para copiar y pegar rápido durante el video:**
   - `1710034065` (Pichincha)
   - `0926615566` (Guayas)
   - `1722886981` (Pichincha)
3. **Cédula inválida para mostrar el error:** `1234567890` o `9999999999`.
