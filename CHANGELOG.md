# 1.0.1 (2026-07-10)

* published to npm as **`node-red-contrib-velux-klf200`** (the original name is taken;
  node types are unchanged, so migration is remove-old + install-new)
* docs: README lists all five fixes, adds an "am I affected?" cert check and a
  migration note

# 1.0.0 (maintained fork, 2026-07-05)

Fork of PLCHome/node-red-contrib-velux 0.0.8. Same node types — drop-in replacement.

* vendored `velux-klf200` 0.0.8 + `velux-klf200-api` 0.1.7 into `lib/` (single
  self-contained package; release tarball bundles npm deps for offline install)
* **fix 1 — TLS fingerprint pinning** replaces chain validation, so connections keep
  working after the bundled factory certificate expires on 2026-07-12
  (`options.fingerprint` override; `options.old` accept-any path preserved)
* **fix 2 — process crash**: `sendValue` discarded its promise; a 5 s command-confirm
  timeout became an unhandled rejection that killed Node-RED on Node ≥ 15
* **fix 3 — catchable errors**: connection errors now use two-arg `node.error()`
  (visible to `catch` nodes / dashboards)
* **fix 4 — listener leak**: `getVelux` cleared no listeners; the 5 s reconnect loop
  leaked ~14 EventEmitter listeners per attempt during a gateway outage
* **fix 5 — no secret in logs**: KLF-200 password is no longer printed in debug output
* tests: `npm test` (module load, TLS pin match/mismatch/legacy, listener-leak
  regression); verified in real Node-RED 5.0.1 / Node.js 24

### 0.0.7: Maintenance Release

**Enhancements**

-- Readme: Current problems

**Fixes**

-- Try to connect to a KLF without any scene. It will reject with "Can't get scene list".


### 0.0.6: Maintenance Release

**Fixes**

- API (KLF) not longer in the connection class, now it is global
- New API with CERT CA
- API 3.18


### 0.0.5: Maintenance Release

**Enhancements**

- readme edited

**Fixes**

- removed: polling instead of House status monitor. Because it does not provide an answer
- fixed some issues from LGTM.com


### 0.0.4: Maintenance Release

**Fixes**

- removed: polling instead of House status monitor. Because it does not provide an answer
- fixed some issues from LGTM.com

### 0.0.3: Maintenance Release

**Enhancements**

- added monitoring method. The KLF200 in version 0.2.0.0.71 can crash on a broken ip connection and deny any login until reset. Therefore you can also choose polling.

### 0.0.2: Maintenance Release

**Enhancements**

- velux nodes: added remaining time
- velux api: added
- velux scenes: added scenes


**Fixes**

- velux api: corrected topic


### 0.0.1: Initial Release
