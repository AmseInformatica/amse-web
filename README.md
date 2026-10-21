# Sitio web AMSE SPA

Sitio corporativo estático construido con HTML, CSS y JavaScript, desplegable en Netlify o cPanel.

## Verificación

```powershell
npm test
```

También puede servirse localmente con cualquier servidor HTTP estático.

## Formulario de contacto

El navegador envía el formulario al despliegue configurado de Google Apps Script. Cuando se modifique `google-apps-script-contacto.gs`, se debe publicar una nueva versión desde Apps Script y comprobar que la URL de despliegue siga coincidiendo con la configurada en `index.html` y `assets/js/main.js`.

El sitio sólo muestra confirmación de éxito después de recibir la respuesta explícita del servidor.

## Protección de datos personales

Cambios preparados para Chile: Ley 19.628 vigente y transición a Ley 21.719 el 1 de diciembre de 2026. El código no certifica el cumplimiento organizacional.

Antes de publicar, desplegar la nueva versión de Apps Script y el sitio conjuntamente: la autorización exige el valor `si` y la versión `2026-09-07`. Probar en una hoja de prueba que rechaza envíos sin autorización y admite teléfono vacío. No reutilizar el servidor anterior con este formulario.

El responsable operativo de AMSE debe:

- Confirmar identidad y domicilio del responsable, proveedores de hosting/correo, ubicaciones del tratamiento, contratos de encargo y garantías de transferencias internacionales. Completar la información pública si la verificación modifica lo informado.
- Restringir Google Sheets, Apps Script y correo al personal que atiende solicitudes; desactivar enlaces públicos, habilitar segundo factor y revisar accesos.
- Revisar mensualmente las solicitudes cerradas y eliminar o anonimizar los datos cuya finalidad haya terminado, incluyendo correos, papelera, exportaciones y copias. Documentar cualquier excepción con fundamento, plazo y acceso restringido. No se instaló borrado automático porque el registro actual no distingue solicitudes activas de cerradas.
- Atender contacto@amse.cl con un responsable y suplente. Registrar fecha, derecho solicitado, verificación proporcional, respuesta y ejecución en todos los sistemas. Aplicar los plazos y recursos de la ley vigente; preparar el procedimiento de la reforma antes de diciembre.
- Mantener un procedimiento de incidentes, confidencialidad, inventario de tratamientos y revisión de proveedores. No activar publicidad o analítica sin evaluar su base legal y controles previos.
- Conservar cada versión del texto de consentimiento junto a su fecha; la hoja registra la fecha del envío y versión aceptada. La versión inicial de estos cambios es 2026-09-07.

Fuentes oficiales: https://www.bcn.cl/leychile/Navegar?idNorma=141599 y https://www.bcn.cl/leychile/Navegar?idNorma=1209272

## Segunda revisión — 21 de octubre de 2026
Se corrigió la confirmación falsa mediante parámetros de URL y el reinicio del temporizador tras enviar. La publicación Netlify usa dist, generado con node build.mjs. Subir sólo el contenido del ZIP, nunca toda la carpeta del proyecto.
Bureau Veritas: se contrastó la copia tmp/pdfs/amse-cert/page-1.png. Coinciden número, norma, alcance, domicilio y vencimiento. Se añadió el domicilio certificado para distinguirlo de otras oficinas. La copia no acredita ausencia de suspensión posterior; confirmar que la imagen de marca sea la autorizada por BV.
Pendiente de verificación real: despliegue de Apps Script, recepción en hoja y correo, renderizado en navegador móvil/escritorio y configuración HTTPS del hosting. No se envió información real durante las pruebas.

## Analytics — 21 de octubre de 2026
Integrado G-N8CKW08FSY con carga sólo tras aceptar. Rechazar mantiene bloqueada la etiqueta; preferencias al pie permiten retirar la autorización. Elección local y cookies de medición configuradas a 180 días. Revisar en GA4 la retención de datos, las funciones de medición mejorada y que Google Signals permanezca desactivado. No configurar recopilación de datos proporcionados por usuarios ni datos del formulario.
Esta entrega reemplaza la versión de consentimiento del formulario por 2026-10-21: publicar también la nueva versión de google-apps-script-contacto.gs. La recepción real de eventos y el comportamiento visual del aviso deben comprobarse en el sitio publicado.

## HSTS
Configurado Strict-Transport-Security: max-age=31536000 para Apache/cPanel y Netlify. No se incluyeron includeSubDomains ni preload: requieren revisar primero todos los subdominios. Mantener certificado TLS válido y renovación automática. Tras subir, verificar la cabecera HTTPS en el servidor real; no basta con abrir index.html localmente.
