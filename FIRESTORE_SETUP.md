# Error 5 NOT_FOUND en Firestore

## Problema
El seed script está fallando con error `5 NOT_FOUND` al intentar escribir a Firestore.

## Causa
Este error indica que la base de datos Firestore no está correctamente inicializada o está en el modo incorrecto.

## Solución

### Opción 1: Verificar Modo de Firestore

1. Ve a [Firestore Console](https://console.firebase.google.com/project/boda-digvijay-maria/firestore)
2. Verifica que diga **"Cloud Firestore"** (no "Datastore

")
3. Debe estar en **Native mode**

### Opción 2: Si no ves la base de datos

1. Ve a [Firebase Console](https://console.firebase.google.com/project/boda-digvijay-maria/firestore)
2. Click en **"Create database"**
3. Selecciona **"Start in production mode"** (más seguro)
4. Región: **europe-west** (o tu preferida)
5. Click **Enable**

### Opción 3: Usar alternativa sin Firestore

Si Firestore sigue dando problemas, podemos:
- Usar solo Supabase (almacenar metadatos en Supabase Database en lugar de Firestore)
- Requiere modificar la arquitectura pero funcionará de inmediato

## Verificación

Una vez creada la base de datos correctamente, ejecuta:
```bash
npx tsx scripts/check-gallery.ts
```

Si no da error, entonces ejecuta:
```bash
npx tsx scripts/seed-gallery.ts
```
