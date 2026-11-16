import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeItem, mergeFeed, reserveBudget } from '../scripts/sync-gangagato.mjs';

const sample = {
  id: 123, url: 'https://whatsapp.com/channel/0029VbBhAgv545uxvcnzOS08/123',
  text: '✅ *12,99 € (antes 25,99 €)*\n➡️ https://www.amazon.es/dp/B00XVN7T70/?tag=otra-21',
  links: ['https://www.amazon.es/dp/B00XVN7T70/?tag=otra-21'],
  postedAt: '2026-11-16T08:00:00.000Z',
  linkPreview: { title: 'Producto de prueba' },
};

test('elimina etiquetas de afiliados ajenos y mantiene los dos precios', () => {
  const item = sanitizeItem(sample);
  assert.deepEqual(item.links, ['https://www.amazon.es/dp/B00XVN7T70']);
  assert.match(item.text, /12,99 € \(antes 25,99 €\)/);
  assert.doesNotMatch(JSON.stringify(item), /otra-21/);
});

test('rechaza mensajes sin un ASIN directo o una fecha válida', () => {
  assert.equal(sanitizeItem({ ...sample, links: [], text: '12,99 €', linkPreview: {} }), null);
  assert.equal(sanitizeItem({ ...sample, postedAt: '???' }), null);
});

test('fusiona mensajes por publicación sin duplicarlos y avanza el cursor', () => {
  const initial = { items: [], lastPostDate: '2026-11-15' };
  const first = mergeFeed(initial, [sample], '2026-11-16T09:00:00.000Z');
  const second = mergeFeed(first, [sample], '2026-11-16T10:00:00.000Z');
  assert.equal(first.newPosts, 1);
  assert.equal(first.lastPostDate, '2026-11-16');
  assert.equal(second.items.length, 1);
  assert.equal(second.newPosts, 0);
});

test('reserva diez céntimos por intento y bloquea el número 41 de cualquier ventana de 31 días', () => {
  const now = '2026-11-16T01:30:00.000Z';
  let ledger = { schemaVersion: 1, reservations: [] };
  for (let i = 1; i <= 40; i++) {
    const reservation = reserveBudget(ledger, now);
    assert.equal(reservation.reservedCents, 10 * i);
    ledger = reservation.ledger;
  }
  assert.equal(reserveBudget(ledger, now), null);
});

test('la reserva es de 31 días móviles, sin doble gasto en el cambio de mes', () => {
  const ledger = { schemaVersion: 1, reservations: [
    { at: '2026-11-30T23:59:00.000Z', maxUsdCents: 10 },
  ] };
  const next = reserveBudget(ledger, '2026-12-01T00:01:00.000Z');
  assert.equal(next.reservedCents, 20);
  const far = reserveBudget(ledger, '2027-01-03T00:01:00.000Z');
  assert.equal(far.reservedCents, 10);
  assert.equal(far.ledger.reservations.length, 1);
});

test('un registro de gastos corrupto impide ejecutar la captura', () => {
  assert.throws(() => reserveBudget({ schemaVersion: 1, reservations: [{ at: '2026-11-16', maxUsdCents: -50 }] }), /corrupto/);
  assert.throws(() => reserveBudget({ schemaVersion: 1, reservations: null }), /inválido/);
});
