# 1.0.0 (fork, 2026-07-05)
* vendored velux-klf200 0.0.8 + velux-klf200-api 0.1.7 into lib/ (single package)
* TLS: fingerprint pinning replaces chain validation (factory cert expires 2026-07-12)
* fix: sendValue unhandled rejection crashed Node-RED on CFM timeout
* fix: connection errors are now catchable (two-arg node.error)

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
