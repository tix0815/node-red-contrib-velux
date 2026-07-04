// Lädt alle Module und prüft Grundinvarianten (Syntax, Exports, Fingerprint).
'use strict'
const assert = require('assert')

// 1) Transport-Layer lädt, Cert wird gelesen, Fingerprint stimmt
const net = require('../lib/velux-klf200-api/lib/net')
assert.ok(net.CA && net.CA.length > 500, 'CA geladen')
const EXPECTED_FP = '02:8C:23:A0:89:2B:62:98:C4:99:00:5B:D2:E7:2E:0A:70:3D:71:6A'
assert.strictEqual(net.pinnedFingerprint, EXPECTED_FP,
  'pinnedFingerprint == SHA1 des Velux-Factory-Certs (openssl-verifiziert)')
assert.ok(net.API && net.API.GW_PASSWORD_ENTER_REQ, 'API-Tabelle exportiert')
assert.strictEqual(typeof net.connect, 'function', 'connect exportiert')

// 2) Mid-Layer lädt (vendored require-Pfade korrekt)
const klf = require('../lib/velux-klf200/klf')
assert.strictEqual(typeof klf.getVelux, 'function', 'getVelux exportiert')

// 3) Node-RED-Node-Module laden (Registrierung erst mit echtem RED — hier nur require)
for (const f of ['../velux-connection.js', '../velux-nodes.js', '../velux-api.js', '../velux-scenes.js']) {
  const mod = require(f)
  assert.strictEqual(typeof mod, 'function', f + ' exportiert RED-Funktion')
}

// 4) Fix-Marker vorhanden (Schutz gegen versehentliches Upstream-Überschreiben)
const fs = require('fs'), path = require('path')
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')
assert.ok(read('lib/velux-klf200-api/lib/net.js').includes('pinnedFingerprint'), 'FIX 1 (TLS-Pinning) vorhanden')
assert.ok(!read('lib/velux-klf200-api/lib/net.js').includes('opt.rejectUnauthorized = true'), 'Chain-Validation entfernt')
assert.ok(read('lib/velux-klf200/nodes.js').match(/sendCommand\(data\)\s*\n\s*\.catch/), 'FIX 2 (sendValue catch) vorhanden')
assert.ok(read('velux-connection.js').includes("source: 'velux-connection'"), 'FIX 3 (catchbare Fehler) vorhanden')

console.log('load.test.js: ALLE CHECKS OK')
