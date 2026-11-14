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
| `loans` | Préstamos que vinculan a un prestamista con un cliente y registran las condiciones del desembolso. |
| `loan_installments` | Cuotas de un préstamo. Cada una tiene su propio monto, vencimiento, estado y tasa diaria de mora. |
| `loan_guarantors` | Personas que actúan como fiadoras de un préstamo específico. |
| `loan_collaterals` | Bienes dados en garantía, con su descripción y valor estimado cuando se conoce. |
| `loan_payments` | Pagos recibidos, con su monto, fecha y usuario que los registró. |
| `installment_payments` | Vincula un pago con la cuota a la que se aplica. Una cuota puede recibir varios abonos. |
| `loan_interest_payments` | Vincula un pago de interés ordinario directamente con el préstamo. |

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

## Arquitectura

La API se organiza en capas: `routes → controllers → services → models`.

- Las **routes** definen el método y la URL y delegan en el controller.
- Los **controllers** reciben `req`/`res`, pasan los datos al service y construyen la respuesta.
- Los **services** contienen la lógica de negocio y no conocen HTTP, lo que permite probarlos de forma aislada.
- Los **models** mapean las tablas MySQL con Sequelize.

Cada router se registra en `src/server/api.js`. Los services lanzan errores tipados (definidos en `src/server/utils/errors.js`) que los controllers traducen a códigos HTTP.

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
   ├─ api.js                router global: monta /users, /roles y /auth
   ├─ config/
   │  ├─ connection.js      conexión Sequelize a MySQL
   │  └─ passport.js        estrategias local y JWT
   ├─ controllers/          intermediarios entre rutas y services
   ├─ services/             lógica de negocio y operaciones
   ├─ routes/               definición de métodos y URLs
   ├─ utils/
   │  └─ errors.js          errores tipados (AppError, ValidationError, ConflictError)
   └─ models/
      ├─ Role.js               tabla roles
      ├─ User.js               tabla users
      ├─ Stakeholder.js        tabla stakeholders
      ├─ Loan.js               tabla loans
      ├─ LoanInstallment.js    tabla loan_installments
      ├─ LoanGuarantor.js      tabla loan_guarantors
      ├─ LoanCollateral.js     tabla loan_collaterals
      ├─ LoanPayment.js        tabla loan_payments
      ├─ InstallmentPayment.js tabla installment_payments
      ├─ LoanInterestPayment.js tabla loan_interest_payments
      └─ associations.js       relaciones entre modelos
```

La documentación por módulo vive en [`.agents/skills/`](.agents/skills/); cada módulo tiene su `SKILL.md` y `CHANGELOG.md`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/roles` | Lista los roles registrados. |
| `GET` | `/api/users` | Lista los usuarios con su stakeholder y rol. |
| `POST` | `/api/auth/signup` | Crea un usuario; valida los campos y hashea la contraseña. Recibe `email`, `password`, `role_id` y `stakeholder_id`. |
| `GET` | `/hello` | Verificación simple de que el servidor responde. |

La autenticación con Passport se inicializa en `src/server/main.js`.