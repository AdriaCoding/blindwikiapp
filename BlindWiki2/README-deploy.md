# Despliegue Automático en GitHub Pages

Este proyecto está configurado para desplegar automáticamente la aplicación web de Expo en GitHub Pages cada vez que se hace un push a la rama `web`.

## Configuración Realizada

1. Se ha agregado `baseUrl: "/BlindWiki2"` en la configuración de `experiments` en `app.json`
2. Se ha instalado la dependencia `gh-pages` como dependencia de desarrollo
3. Se han agregado scripts en `package.json`:
   - `predeploy`: Exporta la aplicación web de Expo
   - `deploy`: Despliega los archivos generados en GitHub Pages
4. Se ha configurado un workflow de GitHub Actions (`.github/workflows/deploy-web.yml`) que:
   - Se activa cuando se hace push a la rama `web`
   - Construye la aplicación web de Expo
   - Despliega los archivos generados en la rama `gh-pages`
5. Se ha comentado la línea `dist/` en `.gitignore` para permitir guardar los archivos generados

## Uso

Para actualizar la aplicación web:

1. Haz tus cambios en la rama `web`
2. Realiza un push a la rama `web` en GitHub
3. GitHub Actions se encargará de:
   - Construir la aplicación web
   - Desplegarla en GitHub Pages

También puedes desplegar manualmente ejecutando:

```bash
npm run deploy
```

## Configuración Adicional en GitHub

Después del primer despliegue, asegúrate de:

1. Ir a Settings > Pages en el repositorio de GitHub
2. Configurar el Source a "Deploy from a branch"
3. Seleccionar la rama `gh-pages` y el directorio `/` (root)
4. Guardar la configuración

La aplicación será accesible en: https://[tu-usuario].github.io/BlindWiki2/ 