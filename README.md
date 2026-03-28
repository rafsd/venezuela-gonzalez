# ✈️ Lista de Viaje — Travel List

Aplicación colaborativa de lista de viaje. Sin backend propio — usa Supabase como base de datos y Surge.sh para hosting estático.

---

## 🗄️ Paso 1 — Configurar Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Abre tu proyecto → **SQL Editor**
3. Pega y ejecuta el contenido de `sql/seed.sql`

Esto crea:
- Tabla `lists` — almacena las listas
- Tabla `items` — almacena los items de cada lista
- Políticas RLS — acceso público sin login
- Realtime habilitado — colaboración en vivo

---

## 🚀 Paso 2 — Deploy a Surge.sh

### Instalar Surge (una sola vez)
```bash
npm install -g surge
```

### Deploy
```bash
cd travel-list-surge
surge . venezuela-gonzalez.surge.sh
```

La primera vez te pedirá tu email y contraseña de Surge.

### Re-deploy (cuando hagas cambios)
```bash
surge . venezuela-gonzalez.surge.sh
```

---

## 📁 Estructura del proyecto

```
travel-list-surge/
├── index.html        # App completa (todo en un archivo)
├── 200.html          # Soporte de rutas SPA para Surge
├── sql/
│   └── seed.sql      # Script para crear tablas en Supabase
└── README.md
```

---

## ✨ Funcionalidades

- **Crear listas** con nombre personalizado
- **Compartir** con un código de 8 caracteres o enlace directo
- **3 tipos de items:** Tarea, Meta, Recordatorio
- **Marcar como completado** con checkbox
- **Filtrar** por tipo o estado
- **Colaboración en tiempo real** — los cambios de otros aparecen automáticamente
- **Sin registro** — solo compartir el enlace
- **Nombres personalizados** — cada persona ingresa su nombre al agregar items
- **Persistencia** — el nombre de usuario se guarda en el navegador

---

## 🔗 URL de la app

Una vez desplegada:
**https://venezuela-gonzalez.surge.sh**

Para unirse a una lista existente, compartir el enlace directo:
`https://venezuela-gonzalez.surge.sh/#CÓDIGO`

---

## 🛠️ Modificar la app

Todo el código está en `index.html`. No hay build step — edita el archivo y haz deploy de nuevo.

Para cambiar las credenciales de Supabase, busca estas líneas en `index.html`:
```js
const SUPABASE_URL = 'https://jrvipragbenkvnqihyjt.supabase.co';
const SUPABASE_ANON = 'sb_publishable_...';
```
