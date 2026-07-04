// Integrationstest fürs TLS-Fingerprint-Pinning (FIX 1):
//  a) Server mit fremdem Zertifikat  -> Verbindung wird ABGELEHNT (Pin-Mismatch)
//  b) options.fingerprint = Server-FP -> Verbindung wird ANGENOMMEN
//  c) options.old = true              -> Legacy-Pfad akzeptiert alles (wie Upstream)
// Ein abgelaufenes Zertifikat verhält sich identisch zu (b): rejectUnauthorized=false
// prüft keine Gültigkeitsdaten — genau der Zweck des Forks.
'use strict'
const tls = require('tls')
const assert = require('assert')
const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'veluxpin-'))
execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${tmp}/key.pem -out ${tmp}/cert.pem ` +
  `-days 2 -nodes -subj "/C=DE/O=TestKLF" 2>/dev/null`)

const serverOpts = { key: fs.readFileSync(`${tmp}/key.pem`), cert: fs.readFileSync(`${tmp}/cert.pem`) }
const server = tls.createServer(serverOpts, sock => { /* Verbindung halten */ })

function freshNet() {
  delete require.cache[require.resolve('../lib/velux-klf200-api/lib/net')]
  delete require.cache[require.resolve('../lib/velux-klf200-api/lib/klf')]
  delete require.cache[require.resolve('../lib/velux-klf200-api/lib/slip')]
  delete require.cache[require.resolve('../lib/velux-klf200-api/lib/tools')]
  return require('../lib/velux-klf200-api/lib/net')
}

server.listen(51200, '127.0.0.1', async () => {
  let serverFP
  { // Server-Fingerprint ermitteln
    const der = Buffer.from(String(serverOpts.cert).replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''), 'base64')
    serverFP = require('crypto').createHash('sha1').update(der).digest('hex')
      .toUpperCase().replace(/(..)(?=.)/g, '$1:')
  }

  // a) Fremdes Cert, Default-Pin (Velux-Factory-FP) -> MUSS abgelehnt werden
  try {
    await freshNet().connect('127.0.0.1', {})
    console.error('FEHLER: Verbindung mit fremdem Cert wurde angenommen!'); process.exit(1)
  } catch (e) {
    assert.ok(/fingerprint mismatch/.test(String(e)), 'Ablehnungsgrund ist Pin-Mismatch: ' + e)
    console.log('a) Pin-Mismatch korrekt ABGELEHNT ✓')
  }

  // b) Expliziter Pin auf das Server-Cert -> MUSS angenommen werden
  const net2 = freshNet()
  await net2.connect('127.0.0.1', { fingerprint: serverFP })
  console.log('b) Expliziter Pin ANGENOMMEN ✓')
  net2.tcpClient.destroy()

  // c) Legacy-Modus (old:true) -> nimmt alles (Upstream-Verhalten)
  const net3 = freshNet()
  await net3.connect('127.0.0.1', { old: true })
  console.log('c) Legacy-Modus (old:true) ANGENOMMEN ✓')
  net3.tcpClient.destroy()

  server.close()
  console.log('tls-pin.test.js: ALLE CHECKS OK')
  process.exit(0)
})

setTimeout(() => { console.error('TIMEOUT'); process.exit(1) }, 15000)
