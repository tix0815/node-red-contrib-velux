// Regressionstest für den Listener-Leak-Fix (FIX 4):
// Jeder getVelux-Versuch registriert Listener auf dem modul-globalen net.js-Emitter.
// Upstream entfernte sie nie -> der 5s-Reconnect-Loop leakte bei Gateway-Ausfall
// unbegrenzt. Nach dem Fix muss die Listener-Zahl über Versuche KONSTANT bleiben.
'use strict'
const assert = require('assert')
const net = require('../lib/velux-klf200-api/lib/net')
const klf = require('../lib/velux-klf200/klf')

async function attempt() {
  try {
    // 127.0.0.1:51200 ohne Server -> schneller ECONNREFUSED-Reject
    await klf.getVelux('127.0.0.1', 'dummy', { startTimeout: 3000 })
  } catch (e) { /* erwartet */ }
}

;(async () => {
  await attempt()
  const after1 = net.listenerCount('NTF') + net.listenerCount('GW_ERROR_NTF')
  for (let i = 0; i < 5; i++) await attempt()
  const after6 = net.listenerCount('NTF') + net.listenerCount('GW_ERROR_NTF')
  assert.strictEqual(after6, after1,
    `Listener wachsen: nach 1 Versuch ${after1}, nach 6 Versuchen ${after6} (Leak!)`)
  assert.ok(after1 >= 1 && after1 <= 4, 'plausible Listenerzahl pro Versuch: ' + after1)
  console.log(`leak.test.js: Listener konstant bei ${after1} über 6 Versuche — ALLE CHECKS OK`)
  process.exit(0)
})()

setTimeout(() => { console.error('TIMEOUT'); process.exit(1) }, 30000)
