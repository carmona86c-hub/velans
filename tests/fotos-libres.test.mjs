import test from 'node:test';
import assert from 'node:assert/strict';
import { consulta, licenciaValida, coincidencia, sinHtml } from '../scripts/buscar-fotos-libres.mjs';

test('licencias: solo las que permiten uso comercial', () => {
  for (const ok of ['CC0', 'Public domain', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0', 'CC BY 2.0']) assert.ok(licenciaValida(ok), ok);
  for (const no of ['CC BY-NC 4.0', 'CC BY-NC-SA 3.0', 'CC BY-ND 4.0', 'Fair use', '', 'All rights reserved', 'GFDL']) assert.ok(!licenciaValida(no), no);
});
test('consulta: marca y modelo, sin palabras genéricas', () => {
  assert.equal(consulta('Casio F-91W — reloj digital clásico').q, 'Casio F-91W');
  assert.equal(consulta('Crocs Classic Clog — zuecos unisex').q, 'Crocs Classic Clog');
  assert.equal(consulta('Auriculares Inalambricos').util, false);
  assert.ok(consulta('Nespresso De’Longhi Inissia — cafetera').util);
});
test('parecido y limpieza de HTML', () => {
  assert.equal(coincidencia(['casio', 'f', '91w'].filter(t => t.length >= 2), 'File:Casio F-91W 5051.jpg'), 1);
  assert.ok(coincidencia(['crocs', 'classic', 'clog'], 'Red shoes on grass') < 0.5);
  assert.ok(coincidencia(['bosch'], 'Hieronymus Bosch 013.jpg') < 0.5, 'solo la marca no basta');
  assert.ok(coincidencia(['logitech', 'm240', 'silent'], 'Logitech M240 Silent Bluetooth Mouse.jpg') === 1);
  assert.equal(sinHtml('<a href="x">Juan &amp; Ana</a>'), 'Juan & Ana');
});
