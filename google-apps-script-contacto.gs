const CORREO_DESTINO = 'contacto@amse.cl';
const SPREADSHEET_ID = '1voPyGqCB1VSVyL3fl7bc4-5z7CZDSIcX_3XJIcEg-4s';
const NOMBRE_HOJA = 'Contactos';
const VERSION_PRIVACIDAD = '2026-10-21';

function doPost(e) {
  try {
    const datos = e.parameter || {};

    if (datos.empresa) {
      return responder({ ok: false, error: 'spam' });
    }

    const nombre = limpiar(datos.nombre);
    const correo = limpiar(datos.correo);
    const telefono = limpiar(datos.telefono);
    const asunto = limpiar(datos.asunto);
    const mensaje = String(datos.mensaje || '').trim();
    const aceptaPrivacidad = datos.acepta_privacidad === 'si' ? 'Si' : 'No';
    const versionPrivacidad = limpiar(datos.version_privacidad);
    const inicioFormulario = Number(datos.form_started || 0);

    if (!nombre || !correo || !asunto || !mensaje || aceptaPrivacidad !== 'Si') {
      return responder({ ok: false, error: 'campos-vacios' });
    }

    if (
      nombre.length > 100 ||
      correo.length > 254 ||
      telefono.length > 30 ||
      asunto.length > 150 ||
      mensaje.length > 3000
    ) {
      return responder({ ok: false, error: 'campos-demasiado-largos' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return responder({ ok: false, error: 'correo-invalido' });
    }

    if (versionPrivacidad !== VERSION_PRIVACIDAD) {
      return responder({ ok: false, error: 'version-privacidad-invalida' });
    }

    const tiempoTranscurrido = Date.now() - inicioFormulario;

    if (!inicioFormulario || tiempoTranscurrido < 2500 || tiempoTranscurrido > 86400000) {
      return responder({ ok: false, error: 'spam' });
    }

    if (excedeLimiteEnvios(correo)) {
      return responder({ ok: false, error: 'demasiados-intentos' });
    }

    const hoja = obtenerHoja();
    hoja.appendRow([
      new Date(),
      protegerCelda(nombre),
      protegerCelda(correo),
      protegerCelda(telefono),
      protegerCelda(asunto),
      protegerCelda(mensaje),
      protegerCelda(aceptaPrivacidad),
      protegerCelda(versionPrivacidad)
    ]);

    MailApp.sendEmail({
      to: CORREO_DESTINO,
      subject: 'Nuevo mensaje desde la web AMSE: ' + asunto,
      body: crearCorreoTexto(nombre, correo, telefono, asunto, mensaje),
      htmlBody: crearCorreoHtml(nombre, correo, telefono, asunto, mensaje),
      replyTo: correo,
      name: 'Sitio Web AMSE SPA'
    });

    return responder({ ok: true });
  } catch (error) {
    return responder({ ok: false, error: 'error-interno' });
  }
}

function obtenerHoja() {
  const libro = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = libro.getSheetByName(NOMBRE_HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
  }

  if (hoja.getLastRow() === 0) {
    hoja.appendRow(['Fecha', 'Nombre', 'Correo', 'Telefono', 'Asunto', 'Mensaje', 'Acepta privacidad', 'Version privacidad']);
  }

  return hoja;
}

function limpiar(valor) {
  return String(valor || '').replace(/[\r\n]+/g, ' ').trim();
}

function protegerCelda(valor) {
  const texto = String(valor || '');
  return /^\s*[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function excedeLimiteEnvios(correo) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(correo).toLowerCase(),
    Utilities.Charset.UTF_8
  );
  const clave = 'contacto-' + digest.map(byte => (byte + 256).toString(16).slice(-2)).join('');
  const cache = CacheService.getScriptCache();

  if (cache.get(clave)) {
    return true;
  }

  cache.put(clave, '1', 60);
  return false;
}

function crearCorreoTexto(nombre, correo, telefono, asunto, mensaje) {
  return (
    'Nuevo mensaje recibido desde el formulario web de AMSE SPA\n\n' +
    'Nombre: ' + nombre + '\n' +
    'Correo: ' + correo + '\n' +
    'Telefono: ' + telefono + '\n' +
    'Asunto: ' + asunto + '\n\n' +
    'Mensaje:\n' + mensaje + '\n'
  );
}

function crearCorreoHtml(nombre, correo, telefono, asunto, mensaje) {
  const nombreSeguro = escaparHtml(nombre);
  const correoSeguro = escaparHtml(correo);
  const telefonoSeguro = escaparHtml(telefono);
  const asuntoSeguro = escaparHtml(asunto);
  const mensajeSeguro = escaparHtml(mensaje).replace(/\n/g, '<br>');
  const mailto = 'mailto:' + encodeURIComponent(correo) +
    '?subject=' + encodeURIComponent('Re: ' + asunto) +
    '&body=' + encodeURIComponent(
      'Hola ' + nombre + ',\n\n' +
      'Te contactamos por tu solicitud enviada desde el sitio web de AMSE.\n\n' +
      'Datos recibidos:\n' +
      'Nombre: ' + nombre + '\n' +
      'Correo: ' + correo + '\n' +
      'Teléfono: ' + telefono + '\n' +
      'Asunto: ' + asunto + '\n\n' +
      'Mensaje original:\n' + mensaje + '\n\n'
    );

  return `
    <div style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#1d2935;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f7;padding:28px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e1e7ee;">
              <tr>
                <td style="background:#111827;padding:26px 30px;border-bottom:5px solid #d6001c;">
                  <div style="font-size:13px;font-weight:700;color:#8fb4b5;letter-spacing:.08em;text-transform:uppercase;">Formulario web</div>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;">Nuevo mensaje desde AMSE</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 30px 10px;">
                  <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#52606d;">
                    Se recibio una nueva solicitud desde el formulario de contacto del sitio web.
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
                    <tr>
                      <td style="width:120px;padding:12px 0;border-bottom:1px solid #edf0f3;color:#6b7785;font-size:13px;font-weight:700;">Nombre</td>
                      <td style="padding:12px 0;border-bottom:1px solid #edf0f3;color:#1d2935;font-size:15px;font-weight:700;">${nombreSeguro}</td>
                    </tr>
                    <tr>
                      <td style="width:120px;padding:12px 0;border-bottom:1px solid #edf0f3;color:#6b7785;font-size:13px;font-weight:700;">Correo</td>
                      <td style="padding:12px 0;border-bottom:1px solid #edf0f3;color:#1d2935;font-size:15px;">
                        <a href="mailto:${correoSeguro}" style="color:#006eb6;text-decoration:none;">${correoSeguro}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="width:120px;padding:12px 0;border-bottom:1px solid #edf0f3;color:#6b7785;font-size:13px;font-weight:700;">Teléfono</td>
                      <td style="padding:12px 0;border-bottom:1px solid #edf0f3;color:#1d2935;font-size:15px;">${telefonoSeguro}</td>
                    </tr>
                    <tr>
                      <td style="width:120px;padding:12px 0;border-bottom:1px solid #edf0f3;color:#6b7785;font-size:13px;font-weight:700;">Asunto</td>
                      <td style="padding:12px 0;border-bottom:1px solid #edf0f3;color:#1d2935;font-size:15px;">${asuntoSeguro}</td>
                    </tr>
                  </table>

                  <div style="margin:0 0 24px;">
                    <div style="font-size:13px;font-weight:700;color:#6b7785;margin-bottom:10px;">Mensaje</div>
                    <div style="background:#f7f9fb;border-left:5px solid #6d9192;border-radius:8px;padding:18px 20px;font-size:15px;line-height:1.65;color:#1d2935;">
                      ${mensajeSeguro}
                    </div>
                  </div>

                  <a href="${mailto}" style="display:inline-block;background:#d6001c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 18px;border-radius:8px;">
                    Responder al cliente
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:22px 30px 28px;color:#8a96a3;font-size:12px;line-height:1.5;">
                  Este correo fue generado automaticamente desde el sitio web de AMSE SPA.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function escaparHtml(valor) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function responder(payload) {
  const respuesta = JSON.stringify(Object.assign({ formulario: 'contacto-amse' }, payload));

  return HtmlService
    .createHtmlOutput(
      '<!doctype html>' +
      '<html><head><meta charset="utf-8"></head><body>' +
      '<script>' +
      'window.parent.postMessage(' + respuesta + ', "*");' +
      '</script>' +
      '</body></html>'
    )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
