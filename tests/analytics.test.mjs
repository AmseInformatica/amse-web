import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');
function visit(saved) {
 const scripts = []; const handlers = {};
 const banner = { hidden: true, querySelector: () => ({ focus() {} }) };
 const storage = new Map(saved ? [['amse-analytics-v1', JSON.stringify({ choice: saved, time: Date.now() })]] : []);
 const context = { Date, JSON, location: { hostname: 'www.amse.cl', origin: 'https://www.amse.cl', pathname: '/', reload() { context.reloaded = true; } }, localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) }, document: { cookie: '', referrer: '', getElementById: () => banner, head: { appendChild: s => scripts.push(s) }, createElement: () => ({}), querySelectorAll: selector => selector === '[data-cookie-choice]' ? ['accepted','rejected'].map(choice => ({ dataset: { cookieChoice: choice }, addEventListener: (_,fn) => { handlers[choice] = fn; } })) : [] } };
 context.window = context;
 vm.runInNewContext(source, context);
 return { scripts, handlers, banner, context };
}
test('sin elección no carga Google y muestra las opciones', () => { const v=visit(); assert.equal(v.scripts.length,0); assert.equal(v.banner.hidden,false); });
test('rechazar impide cargar Google también en visitas posteriores', () => { const v=visit('rejected'); assert.equal(v.scripts.length,0); assert.equal(v.banner.hidden,true); });
test('aceptar carga la etiqueta una sola vez y retirar bloquea la medición', () => { const v=visit(); v.handlers.accepted(); v.handlers.accepted(); assert.equal(v.scripts.length,1); assert.match(v.scripts[0].src,/G-N8CKW08FSY/); v.handlers.rejected(); assert.equal(v.context['ga-disable-G-N8CKW08FSY'],true); assert.equal(v.context.reloaded,true); });
