# Publicación de amse.cl desde GitHub

1. Crear un repositorio privado para el sitio y usar main como rama de publicación.
2. Subir los archivos del proyecto; excluir dist, entrega, tmp y credenciales.
3. En GitHub, Settings > Environments, crear amse-cl.
4. Dentro de ese entorno, añadir los secretos FTP_HOST (ftp.amse.cl), FTP_USER (web@amse.cl) y FTP_PASSWORD (contraseña de la cuenta FTP). No poner contraseñas en archivos ni en el chat.
5. Confirmar en cPanel que web@amse.cl apunta a /home/amsecl/public_html. El script publica en la raíz visible de esa cuenta.
6. Cada envío a main ejecuta las pruebas, prepara dist y publica por FTPS explícito con validación del certificado. También puede iniciarse desde Actions > Publicar AMSE.cl > Run workflow.

La transferencia no borra carpetas ni archivos existentes del servidor. El index.html se transfiere al final. No es una publicación atómica: si falla una transferencia, revisar el estado y volver a ejecutar. Mantener una copia de respaldo inicial del sitio y de .htaccess antes de activar el primer envío.

El flujo aún no está conectado ni probado contra el hosting. Si el certificado FTPS no corresponde a ftp.amse.cl, obtener del proveedor el nombre correcto del servidor; conservar la validación TLS.

Este flujo sólo publica amse.cl. Google Apps Script se actualiza por separado. No publicar este .htaccess en amse-services.cl sin adaptarlo previamente.
