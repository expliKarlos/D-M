# PROBLEMA: Base de datos con nombre incorrecto

## Situación
- Los datos están en: `db-dm-2026-2`
- El frontend solo puede leer de: `(default)`

## Solución

### Paso 1: Crear base de datos (default)

1. Ve a: https://console.firebase.google.com/project/boda-digvijay-maria/firestore
2. Click en el dropdown donde dice "db-dm-2026-2"
3. Click "Create database"
4. **Dejar el nombre vacío** (esto crea "(default)")
5. Modo: **Test mode**
6. Región: **europe-west**
7. Enable

### Paso 2: Ejecutar seed de nuevo

```bash
npx tsx scripts/seed-gallery.ts
```

El script ya está modificado para usar `(default)` automáticamente.

### Paso 3: Verificar

Actualiza el navegador y las fotos deberían aparecer inmediatamente.

---

## Nota técnica

Firebase Client SDK (usado en el frontend) **no soporta** bases de datos con nombres personalizados.
Solo Admin SDK puede acceder a DBs custom.

Por eso necesitamos usar "(default)".
