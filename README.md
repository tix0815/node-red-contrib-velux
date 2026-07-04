# node-red-contrib-velux (maintained fork)

Drop-in fork of [PLCHome/node-red-contrib-velux](https://github.com/PLCHome/node-red-contrib-velux)
with the transport libraries `velux-klf200` and `velux-klf200-api` **vendored** into
`lib/` (single package, no dependency chain). Node types are unchanged
(`velux-connection`, `Velux Nodes`, `Velux Api`, `Velux Scenes`) — existing flows
keep working without modification.

## Why this fork

| # | Fix | Upstream problem |
|---|-----|------------------|
| 1 | **TLS fingerprint pinning** (`lib/velux-klf200-api/lib/net.js`) | The bundled Velux factory certificate expires **2026-07-12**. Upstream validates the chain (`rejectUnauthorized: true` + bundled CA), so every reconnect after that date fails with `CERT_HAS_EXPIRED`. The fork authenticates the gateway by SHA1 fingerprint of the factory cert instead — independent of validity dates. Override with `options.fingerprint` if your device presents a different cert. |
| 2 | **Crash fix** (`lib/velux-klf200/nodes.js`) | `sendValue` discarded the command promise; a 5s CFM timeout (device offline / deleted node) became an unhandled rejection that killed the whole Node-RED process (Node >= 15). Now caught and emitted on the connection's error channel. |
| 3 | **Catchable errors** (`velux-connection.js`) | Connection errors used single-arg `node.error()` (log only). Now two-arg — visible to `catch` nodes / dashboards. |

## Install (Node-RED container)

```bash
cd /data   # userDir
npm install https://github.com/tix0815/node-red-contrib-velux/archive/refs/heads/main.tar.gz
# restart Node-RED
```

npm removes the old registry version automatically (same package name, higher version).

## Credits

Original work by Chris Traeger (PLCHome), MIT licensed. This fork preserves all
copyright notices; see LICENSE.
