import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/css/style.css'), 'utf8');
const javascript = readFileSync(resolve(root, 'assets/js/main.js'), 'utf8');
const appsScript = readFileSync(resolve(root, 'google-apps-script-contacto.gs'), 'utf8');
const netlifyConfig = readFileSync(resolve(root, 'netlify.toml'), 'utf8');
const jsonLdSource = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];

test('todos los recursos locales referenciados existen', () => {
  const references = new Set();

  for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?]+)/g)) {
    references.add(match[1]);
  }

  for (const match of css.matchAll(/url\(["']?(\.\.\/[^"')]+)/g)) {
    references.add(`assets/${match[1].slice(3)}`);
  }

  for (const reference of references) {
    assert.doesNotThrow(() => statSync(resolve(root, reference)), reference);
  }
});

test('el formulario sólo confirma éxito desde la respuesta del servidor', () => {
  const successCalls = javascript.match(/mostrarMensajeFormulario\('enviado'\)/g) || [];
  assert.equal(successCalls.length, 1);
  assert.match(javascript, /TIEMPO_ESPERA_ENVIO_MS/);
  assert.doesNotMatch(javascript, /datos\.set\('empresa', ''\)/);
});

test('el formulario expone estado y navegación accesibles', () => {
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /<label class="sr-only" for="contactoNombre">/);
});

test('Apps Script limita y protege los datos almacenados', () => {
  assert.match(appsScript, /protegerCelda\(mensaje\)/);
  assert.match(appsScript, /replyTo: correo/);
  assert.match(appsScript, /excedeLimiteEnvios\(correo\)/);
});

test('Google puede identificar el sitio y la organización AMSE', () => {
  assert.ok(jsonLdSource, 'Falta JSON-LD');
  const data = JSON.parse(jsonLdSource);
  const website = data['@graph'].find(item => item['@type'] === 'WebSite');
  const organization = data['@graph'].find(item => item['@type'] === 'Organization');

  assert.equal(website.name, 'AMSE');
  assert.equal(website.alternateName, 'AMSE SPA');
  assert.equal(organization.name, 'AMSE SPA');
  assert.equal(organization.address[1].streetAddress, 'Santa Beatriz 111, Oficina 803');
  assert.match(html, /<title>AMSE SPA \| Soluciones eléctricas industriales en Chile<\/title>/);
  assert.match(html, /<h1>AMSE SPA: soluciones eléctricas industriales/);
});

test('la certificación ISO se comunica con norma, alcance y trazabilidad precisos', () => {
  assert.match(html, /Sistema de gestión de calidad certificado/);
  assert.match(html, /ISO 9001:2015 \/ NCh-ISO 9001:2015/);
  assert.match(html, /servicios de integración y armado de tableros eléctricos/);
  assert.match(html, /Certificado N\.º BVCSG15954/);
  assert.doesNotMatch(html, /productos (?:AMSE )?certificados/i);
});

test('la navegación enlaza la intranet oficial de AMSE de forma segura', () => {
  assert.match(html, /href="https:\/\/script\.google\.com\/a\/macros\/amse\.cl\/s\/AKfycbxALPzAN5LW92zNuk_k35aZJQ7uAWJV3sNgWRUDExuAeurDMvMTAkx8cPe_9gG11tgcUQ\/exec"/);
  assert.match(html, /aria-label="Abrir Intranet AMSE en una pestaña nueva"/);
  assert.doesNotMatch(html, /aria-label="Intranet próximamente"/);
});

test('la política CSP autoriza exactamente el JSON-LD publicado', () => {
  const hash = createHash('sha256').update(jsonLdSource).digest('base64');
  assert.match(netlifyConfig, new RegExp(`sha256-${hash.replace(/[+]/g, '\\+')}`));
});

test('ningún recurso publicado supera 1 MB', () => {
  const references = [...html.matchAll(/(?:src|href)="(assets\/[^"?]+)/g)].map(match => match[1]);

  for (const reference of new Set(references)) {
    assert.ok(statSync(resolve(root, reference)).size < 1024 * 1024, reference);
  }
});
