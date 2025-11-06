# 🏥 NUNUMEDIC - Sistema de Gestión Farmacéutica

[![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)](https://github.com/usuario/nunumedic)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-orange)](https://mysql.com/)

## 📋 Descripción

NUNUMEDIC es un **sistema web Fullstack** diseñado para automatizar la gestión completa de farmacias y boticas. Ofrece control de inventario, sistema de ventas, gestión de usuarios y reportes en tiempo real, desarrollado con tecnologías modernas para garantizar eficiencia y escalabilidad.

### ✨ Características Principales

- 📦 **Gestión de Inventario**: Control completo de productos con alertas de stock mínimo
- 💰 **Sistema de Ventas**: Registro de ventas con múltiples métodos de pago
- 👥 **Gestión de Usuarios**: Control de administradores con diferentes roles
- 📊 **Dashboard Interactivo**: Métricas y estadísticas en tiempo real
- 🔔 **Notificaciones Inteligentes**: Alertas automáticas de stock bajo y vencimientos
- 📈 **Historial de Movimientos**: Seguimiento detallado de entradas y salidas
- 🎨 **Interfaz Responsiva**: Diseño moderno adaptable a todos los dispositivos
- 🔐 **Autenticación Segura**: Sistema de login con JWT y roles de usuario

## 🏗️ Arquitectura del Proyecto

```
NUNUMED/
├── 📁 frontend/          # React + Tailwind CSS + Vite
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas principales
│   │   ├── layout/       # Layouts y navegación
│   │   ├── context/      # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API services
│   └── ...
├── 📁 backend/           # Node.js + Express + MySQL
│   ├── src/
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Definición de rutas API
│   │   ├── middleware/   # Middlewares personalizados
│   │   └── config/       # Configuraciones
│   └── migrations/       # Migraciones de BD
├── 📁 sql/              # Scripts de base de datos
│   └── nunumed.sql      # Dump completo de la BD
└── 📄 README.md
```

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Tailwind CSS** - Framework de CSS utilitario
- **Vite** - Herramienta de construcción rápida
- **React Router DOM** - Enrutamiento SPA
- **Axios** - Cliente HTTP para API
- **Lucide React** - Librería de iconos moderna

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web minimalista
- **MySQL** - Base de datos relacional
- **Knex.js** - Query builder SQL
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hash seguro de contraseñas
- **CORS** - Configuración de recursos cruzados
- **Dotenv** - Gestión de variables de entorno

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- MySQL 8.0+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/nunumedic.git
cd nunumedic
```

### 2. Configurar Base de Datos
```bash
# Importar la base de datos
mysql -u root -p
CREATE DATABASE nunumed;
USE nunumed;
SOURCE sql/nunumed.sql;
```

### 3. Configurar Backend
```bash
cd backend

# Instalar dependencias
npm init -y
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken nodemailer knex
npm install --save-dev nodemon

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=nunumed
# JWT_SECRET=tu_jwt_secret

# Ejecutar en modo desarrollo
npm run dev
```

### 4. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🖥️ URLs del Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol | DNI |
|---------|------------|-----|-----|
| 72357275 | 72357275 | Super Admin | 72357275 |
| 87654321 | 87654321 | Admin | 87654321 |

## 📚 Estructura de la Base de Datos

### Tablas Principales
- **usuario** - Administradores del sistema
- **categoria** - Categorías de productos
- **producto** - Inventario de productos
- **cliente** - Base de datos de clientes
- **venta** - Registro de ventas
- **detalle_venta** - Detalles de cada venta
- **movimiento_stock** - Historial de movimientos

## 🌟 Funcionalidades Destacadas

### Dashboard
- Resumen de ventas diarias/mensuales
- Productos con stock bajo
- Productos próximos a vencer
- Gráficos de tendencias

### Inventario
- CRUD completo de productos
- Categorización avanzada
- Control de stock mínimo
- Fechas de vencimiento
- Filtros y búsqueda

### Ventas
- Carrito de compras intuitivo
- Múltiples métodos de pago
- Impresión de tickets
- Historial de ventas

### Movimientos
- Registro de entradas y salidas
- Trazabilidad completa
- Reportes detallados

## 🔧 Scripts Disponibles

### Backend
```bash
npm start      # Producción
npm run dev    # Desarrollo con nodemon
```

### Frontend
```bash
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción
npm run preview # Preview del build
```

## 📱 Responsive Design

El sistema está completamente optimizado para:
- 📱 **Móviles** (320px+)
- 📟 **Tablets** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Pantallas grandes** (1440px+)

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Hash de contraseñas con bcrypt
- Validación de datos en frontend y backend
- Protección contra inyección SQL
- CORS configurado correctamente

## 🚀 Despliegue

### Variables de Entorno Requeridas
```env
# Base de datos
#DB_HOST=localhost
#DB_USER=root
#DB_PASSWORD='tu contraseña de base de datos'
#DB_NAME='tu base de datos'
#PORT=4000
#SMTP_HOST=smtp.gmail.com
#SMTP_USER= 'tu gmail'
#SMTP_PASSWORD= 'tu contraseña de aplicación gmail'
#SMTP_PORT=587
#SMTP_SECURE=false
#ALERT_EMAIL_TO= 'tu gmail'
#VITE_FRONTEND_URL=http://localhost:5173

# Servidor
PORT=4000

```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**L. David Mesta**
- Email: davidmesta@gmail.com
- GitHub: [@davidmesta](https://github.com/davidmesta)



---

⭐ **¡Dale una estrella si te gusta este proyecto!** ⭐
