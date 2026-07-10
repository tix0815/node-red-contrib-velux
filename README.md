# node-red-contrib-velux (maintained fork)

Node-RED nodes for the **Velux KLF-200** io-homecontrol® gateway.

A drop-in, maintained fork of [PLCHome/node-red-contrib-velux](https://github.com/PLCHome/node-red-contrib-velux)
(unmaintained since 2021). The transport libraries `velux-klf200` and `velux-klf200-api`
are **vendored** into `lib/` — one self-contained package instead of a three-package
dependency chain. Node types are unchanged (`velux-connection`, `Velux Nodes`,
`Velux Api`, `Velux Scenes`), so **existing flows keep working without any change**.

> ## ⚠️ If you use the KLF-200 nodes, read this
> The Velux **factory TLS certificate bundled in the upstream package expires on
> `2026-07-12 09:38 UTC`.** The upstream code validates the certificate chain, so
> **after that date every (re)connect to your KLF-200 fails** with
> `CERT_HAS_EXPIRED` — blinds stop responding, and a Node-RED restart won't bring
> them back. Your currently-open connection keeps working only until the next
> disconnect (reboot, network blip, deploy).
>
> **This fork fixes it** by pinning the gateway's certificate *fingerprint* instead
> of validating its expiry. Install it before your next reconnect.
>
> **Am I affected?** Check the bundled cert's expiry on your host:
> ```bash
> find / -path '*velux-klf200-api/cert/velux-cert.pem' 2>/dev/null \
>   -exec openssl x509 -in {} -noout -enddate \;
> # notAfter=Jul 12 09:38:26 2026 GMT  -> affected
> ```

## What this fork fixes

| # | Fix | Upstream problem |
|---|-----|------------------|
| 1 | **TLS fingerprint pinning** — `lib/velux-klf200-api/lib/net.js` | Bundled factory cert expires **2026-07-12**; upstream does chain validation (`rejectUnauthorized: true` + bundled CA) so every reconnect afterwards throws `CERT_HAS_EXPIRED`. Now the gateway is authenticated by the SHA-1 fingerprint of its factory cert — independent of validity dates. Override with `options.fingerprint` if your device presents a different cert; the upstream `options.old` (accept-any) path is preserved. |
| 2 | **Process-crash fix** — `lib/velux-klf200/nodes.js` | `sendValue` discarded the command promise. A 5 s command-confirm timeout (device offline, deleted node index) became an *unhandled promise rejection* that killed the entire Node-RED process on Node ≥ 15. Now caught and surfaced on the connection's error channel. |
| 3 | **Catchable connection errors** — `velux-connection.js` | Connection errors used single-argument `node.error()` (log only, invisible to flows). Now two-argument — a `catch` node (and thus a dashboard toast / notification) can react to a lost gateway. |
| 4 | **Listener-leak fix** — `lib/velux-klf200/klf.js` | Every reconnect attempt registered ~14 listeners on the module-global event emitter and never removed them. During a gateway outage the built-in 5 s reconnect loop grew them without bound (memory + CPU per incoming frame). `getVelux` now clears stale listeners on each attempt. |
| 5 | **No password in debug log** — `lib/velux-klf200-api/lib/net.js` | Upstream logged the KLF-200 password in clear text when `DEBUG=velux-klf200-api:*` was set (which its own README recommends). Redacted. |

## Install

Via the Node-RED editor: **Manage palette → Install → upload** the `.tgz` from the
[latest release](https://github.com/tix0815/node-red-contrib-velux/releases/latest),
then restart Node-RED.

Or from a shell **in your Node-RED user directory** (this matters — see note):

```bash
cd ~/.node-red   # or /data in the official Docker image — your *userDir*, not the app dir
npm install https://github.com/tix0815/node-red-contrib-velux/releases/latest/download/node-red-contrib-velux-1.0.0.tgz
# then restart Node-RED
```

npm removes the old registry version automatically (same package name, higher version).
The release tarball **bundles its dependencies**, so the install needs no npm-registry
access.

> **Install into the right directory.** Node-RED loads palette modules from its
> *userDir* (`~/.node-red`, or `/data` in the Docker image), which takes precedence
> over the application directory. Installing elsewhere silently has no effect. Verify:
> ```bash
> find / -path '*node-red-contrib-velux/package.json' 2>/dev/null -exec grep -H '"version"' {} \;
> ```
> The copy under your userDir must read `1.0.0` after install + restart.

## Compatibility

Tested on **Node-RED 5.0.1 / Node.js 24** (and the 4.x line). Requires Node ≥ 18.

## Configuration

Node configuration is identical to upstream — see the original
[documentation](https://github.com/PLCHome/node-red-contrib-velux). The only new,
optional knob is passing `options.fingerprint` (an `AA:BB:…` SHA-1 string) through
the connection config if your gateway serves a certificate other than the standard
Velux factory one.

## Credits & license

Original work © Chris Traeger (PLCHome) — `node-red-contrib-velux`, `velux-klf200`,
`velux-klf200-api`, all MIT. This fork preserves every upstream copyright notice.
Maintained by [tix0815](https://github.com/tix0815). MIT — see [LICENSE](LICENSE).
