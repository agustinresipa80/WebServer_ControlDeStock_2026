# Stock API

API REST de stock y ventas para un comercio. Node.js + Express + MongoDB (Mongoose).

## Arquitectura
`router → controlador → servicio → DAO (factory) → modelo/DB`

- `modelo/`: entidades con validación (Joi).
- `modelo/DAOs/*/…Factory.js`: elige la persistencia según `MODO_PERSISTENCIA` (`MEM` o `MONGO`).
- `servicio/`: lógica de negocio y casos complejos (ventas con stock, rentabilidad, reposición).

## Configuración (archivo `.env`, ver `.env.example`)
`PORT`, `MODO_PERSISTENCIA`, `STRCNX`, `BASE`, `DIAS_ANALISIS`, `DIAS_OBJETIVO`.

## Ejecución
```
npm install
npm start      # MODO_PERSISTENCIA=MONGO para usar MongoDB
npm test       # corre con persistencia en memoria, no necesita Mongo
```

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| POST | /productos | Alta de producto |
| GET | /productos?categoria= | Lista productos activos |
| GET | /productos/:id | Consulta |
| PUT | /productos/:id | Modificación |
| DELETE | /productos/:id | Baja lógica |
| POST | /ventas | Registra venta `{ items: [{ producto, cantidad }] }` y descuenta stock |
| GET | /ventas | Lista ventas no anuladas |
| GET | /ventas/:id | Consulta |
| DELETE | /ventas/:id | Anula la venta y restituye stock |
| GET | /reportes/rentabilidad?desde=&hasta=&agrupar=producto\|categoria | Ganancia y margen |
| GET | /reportes/reposicion?dias=&objetivo= | Productos a reponer |
