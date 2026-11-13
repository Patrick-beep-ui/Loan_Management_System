# Loan Management System

Aplicación web para administrar préstamos, desde el desembolso hasta el pago de la última cuota. El sistema reúne en un solo lugar quién presta el dinero, quién lo recibe, qué fiadores o bienes respaldan el préstamo y cómo se han aplicado los pagos.

El propósito es **reemplazar el control manual de préstamos** por un registro que permita consultar el saldo de cada cuota, identificar vencimientos y ver cuándo se recibió cada abono y quién lo registró.

## Alcance

- Registrar préstamos con su monto, tasa de interés ordinario, fecha de desembolso y calendario de cuotas.
- Registrar uno o varios abonos por cuota y llevar por separado los pagos de interés ordinario.
- Identificar cuotas pendientes, pagadas, vencidas o reprogramadas, y calcular la mora diaria por cuota.
- Consultar el historial de préstamos de una persona como cliente, prestamista o fiador.

## Entidades

| Entidad | Qué representa |
| --- | --- |
| `stakeholders` | Personas que participan en los préstamos. Una misma persona puede ser cliente en un préstamo y fiadora en otro. |
| `users` | Cuentas de acceso vinculadas a una persona. |
| `roles` | Roles de acceso al sistema, como `admin` y `operator`. |

## Tecnologías

React y Vite para la interfaz, Express para la API y MySQL con Sequelize para el acceso a datos. Vite Express permite servir la interfaz y la API desde el mismo servidor.

- React 19 y Vite 6 (con `@vitejs/plugin-react`).
- Express 5 con módulos ES (`"type": "module"`).
- MySQL a través de Sequelize 6 y `mysql2`.
- Autenticación con Passport (estrategias local y JWT) y `bcryptjs`.
- Gestor de paquetes: pnpm.

## Requisitos

- Node.js con soporte para `--env-file` (Node 20 o superior).
- pnpm.
- Servidor MySQL accesible con una base de datos creada.

## Configuración

Las credenciales se leen desde `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=...
DB_NAME=loan_management_system
JWT_SECRET=...
```

## Comandos

```bash
pnpm install   # instala dependencias
pnpm dev       # inicia el servidor de desarrollo en http://localhost:3000
pnpm build     # compila la interfaz con Vite en dist/
pnpm start     # inicia el servidor en modo producción
```

`pnpm dev` ejecuta nodemon sobre `src/server`, cargando `.env` con `node --env-file=.env`.

## Estructura del proyecto

```
src/
├─ client/                  interfaz React (Vite)
│  ├─ main.jsx              punto de entrada de React
│  ├─ App.jsx               componente principal
│  ├─ App.css / index.css
│  └─ assets/
└─ server/                  API Express
   ├─ main.js               servidor, monta /api y escucha en el puerto 3000
   ├─ api.js                rutas de la API
   ├─ config/
   │  ├─ connection.js      conexión Sequelize a MySQL
   │  └─ passport.js        estrategias local y JWT
   └─ models/
      ├─ Role.js            tabla roles
      ├─ User.js            tabla users
      ├─ Stakeholder.js     tabla stakeholders
      └─ associations.js    relaciones entre modelos
```

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/roles` | Lista los roles registrados. |
| `GET` | `/api/users` | Lista los usuarios con su stakeholder y rol. |
| `POST` | `/api/signup` | Crea un usuario; hashea la contraseña con bcrypt. Recibe `email`, `password`, `role_id` y `stakeholder_id`. |
| `GET` | `/hello` | Verificación simple de que el servidor responde. |

La autenticación con Passport se inicializa en `src/server/main.js`.