import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../google-apps-script-contacto.gs', import.meta.url), 'utf8');
function submit(overrides) {
  const rows = [], emails = [];
  const context = vm.createContext({ MailApp: { sendEmail: mail => emails.push(mail) } });
  vm.runInContext(source, context);
  context.responder = value => value;
  context.obtenerHoja = () => ({ appendRow: row => rows.push(row) });
  context.excedeLimiteEnvios = () => false;
  const result = context.doPost({ parameter: { nombre: 'Persona', correo: 'persona@example.com', asunto: 'Consulta', mensaje: 'Servicios', acepta_privacidad: 'si', version_privacidad: '2026-10-21', form_started: String(Date.now()-5000), ...overrides } });
  return { result, rows, emails };
}
test('sin autorización explícita no almacena ni envía datos', () => {
  for (const value of [undefined, '', 'no', 'false', 'on']) {
    const { result, rows, emails } = submit({ acepta_privacidad: value });
    assert.equal(result.ok, false); assert.equal(rows.length, 0); assert.equal(emails.length, 0);
  }
});
test('rechaza una política ausente o desactualizada antes de guardar', () => {
  for (const version of [undefined, '2026-07-06']) {
    const { result, rows, emails } = submit({ version_privacidad: version });
    assert.equal(result.ok, false); assert.equal(rows.length, 0); assert.equal(emails.length, 0);
  }
});
test('permite teléfono vacío y registra evidencia de consentimiento', () => {
  const { result, rows, emails } = submit({ telefono: '' });
  assert.equal(result.ok, true); assert.equal(rows[0][3], '');
  assert.equal(rows[0][6], 'Si'); assert.equal(rows[0][7], '2026-10-21'); assert.equal(emails.length, 1);
});
