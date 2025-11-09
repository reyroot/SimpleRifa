# Sistema de Rifas - Full Stack

Aplicación web completa para gestión de rifas desarrollada con Node.js, Express, MongoDB, Mongoose y Vue.js 3.

## 🚀 Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Express Validator (validación)
- Multer (upload de archivos)

### Frontend
- Vue.js 3 (Composition API)
- Vue Router
- Pinia (State Management)
- Axios
- Vite

## 📁 Estructura del Proyecto

```
Rifa/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   ├── store/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   └── package.json
└── README.md
```

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (local o remoto)

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/rifa
ADMIN_SECRET_TOKEN=tu-token-secreto-aqui
```

4. Crea la carpeta para uploads:
```bash
mkdir uploads
```

5. Inicia el servidor:
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### Frontend

1. Navega a la carpeta frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Autenticación Admin

El sistema usa un token estático para la autenticación del administrador. El token se configura en el archivo `.env` del backend como `ADMIN_SECRET_TOKEN`.

Para iniciar sesión como administrador:
1. Ve a `/admin/login`
2. Ingresa el token configurado en `ADMIN_SECRET_TOKEN`

## 📋 Funcionalidades

### Públicas
- Ver rifas activas
- Ver detalles de una rifa
- Comprar números (flujo completo de checkout)
- Subir comprobante de pago
- Buscar mis tickets por email

### Administración
- Dashboard con estadísticas
- CRUD de Rifas
- Gestión de Pedidos (aprobar/rechazar)
- Realizar sorteos
- CRUD de Métodos de Pago

## 🔌 API Endpoints

### Públicos
- `GET /api/raffles` - Lista rifas activas
- `GET /api/raffles/:id` - Detalle de rifa
- `GET /api/payment-methods` - Métodos de pago activos
- `GET /api/tickets/my-tickets?email=...` - Buscar tickets por email
- `POST /api/orders` - Crear pedido
- `POST /api/orders/:id/upload-proof` - Subir comprobante

### Admin (requieren token)
- `GET /api/admin/raffles` - Lista todas las rifas
- `POST /api/admin/raffles` - Crear rifa
- `PUT /api/admin/raffles/:id` - Actualizar rifa
- `DELETE /api/admin/raffles/:id` - Eliminar rifa
- `POST /api/admin/raffles/:id/draw` - Realizar sorteo
- `GET /api/admin/orders` - Lista pedidos
- `POST /api/admin/orders/:id/approve` - Aprobar pedido
- `POST /api/admin/orders/:id/cancel` - Cancelar pedido
- `GET /api/admin/payment-methods` - Lista métodos de pago
- `POST /api/admin/payment-methods` - Crear método de pago
- `PUT /api/admin/payment-methods/:id` - Actualizar método
- `DELETE /api/admin/payment-methods/:id` - Eliminar método
- `POST /api/admin/login` - Login admin

## 🎯 Flujo de Compra

1. Usuario selecciona una rifa y hace clic en "Comprar Números"
2. Completa el formulario con sus datos (nombre, email, teléfono) y cantidad
3. Selecciona método de pago
4. Sube comprobante de pago
5. El pedido queda en estado "pending_approval"
6. Admin revisa y aprueba el pedido
7. Se generan los números aleatorios únicos
8. Usuario recibe email con sus números (funcionalidad pendiente de implementar)

## 🗄️ Modelos de Datos

### Raffle (Rifa)
- Información de la rifa
- Estado (draft, active, drawing_pending, finished)
- Números máximos y precio por número
- Tickets ganadores

### Order (Pedido)
- Información del comprador
- Cantidad de números
- Estado del pago
- Comprobante de pago

### Ticket (Boleto)
- Número asignado (formateado con padding)
- Referencia a rifa y pedido
- Email del propietario (denormalizado para búsquedas rápidas)
- Indicador de ganador

### PaymentMethod (Método de Pago)
- Nombre y detalles
- Estado activo/inactivo

## 🔒 Seguridad

- Token estático para autenticación admin (Bearer Token)
- Middleware `adminCheck` protege todas las rutas `/api/admin/*`
- Validación de entrada con express-validator
- Sanitización de datos del usuario

## 📝 Notas

- En producción, se recomienda:
  - Subir las imágenes de comprobantes a un servicio de almacenamiento (S3, Cloudinary, etc.)
  - Implementar envío de emails cuando se aprueban pedidos
  - Añadir más validaciones de seguridad
  - Usar variables de entorno para todas las configuraciones sensibles

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo
- Revisa la URI en el archivo `.env`

### Error 403 en rutas admin
- Verifica que el token esté configurado correctamente
- Asegúrate de incluir el header `Authorization: Bearer <token>`

### Error al subir archivos
- Verifica que la carpeta `uploads/` exista en el backend
- Revisa los permisos de escritura

## 📄 Licencia

Este proyecto es de uso interno.

