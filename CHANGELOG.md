# Changelog

## [0.6.5](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.4...v0.6.5) (2026-09-15)


### Bug Fixes

* break health check on purpose ([#46](https://github.com/pruthvi145/pipeline-sandbox/issues/46)) ([8d7e36a](https://github.com/pruthvi145/pipeline-sandbox/commit/8d7e36ada7a3d5a08685308149d482f750d0f01c))

## [0.6.4](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.3...v0.6.4) (2026-09-15)


### Bug Fixes

* **ci:** cleanup-on-failure never actually ran despite matching its own condition ([05f9fc3](https://github.com/pruthvi145/pipeline-sandbox/commit/05f9fc308ad2c6a589bf0377ddaa34a84a410779))
* **ci:** drop x-vercel-set-bypass-cookie - it causes an infinite redirect loop under curl ([1436a2e](https://github.com/pruthvi145/pipeline-sandbox/commit/1436a2e7431d0460d17b747f88c9fa0b46f5a5ab))
* **ci:** smoke-check never actually reached the app - Vercel SSO wall swallowed it ([1d8d5c5](https://github.com/pruthvi145/pipeline-sandbox/commit/1d8d5c5568689c0a2383fcbb8445841b69abf3c6))
* test hotfix pipeline ([#40](https://github.com/pruthvi145/pipeline-sandbox/issues/40)) ([7da364b](https://github.com/pruthvi145/pipeline-sandbox/commit/7da364bed908c9eb6ba97b92895490e2b63aec9c))


### Maintenance

* **release/v0.6.3:** release 0.6.4 ([#41](https://github.com/pruthvi145/pipeline-sandbox/issues/41)) ([7d9916c](https://github.com/pruthvi145/pipeline-sandbox/commit/7d9916c545132046fbd115ab7bd5feda6c394cef))
* revert manifest after failed hotfix v0.6.4 ([6c009f6](https://github.com/pruthvi145/pipeline-sandbox/commit/6c009f6eaa406b4d88764f658b1508a6a9b9c275))

## [0.6.4](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.3...v0.6.4) (2026-09-15)


### Bug Fixes

* **ci:** cleanup-on-failure never actually ran despite matching its own condition ([05f9fc3](https://github.com/pruthvi145/pipeline-sandbox/commit/05f9fc308ad2c6a589bf0377ddaa34a84a410779))
* **ci:** smoke-check never actually reached the app - Vercel SSO wall swallowed it ([1d8d5c5](https://github.com/pruthvi145/pipeline-sandbox/commit/1d8d5c5568689c0a2383fcbb8445841b69abf3c6))
* test hotfix pipeline ([#40](https://github.com/pruthvi145/pipeline-sandbox/issues/40)) ([7da364b](https://github.com/pruthvi145/pipeline-sandbox/commit/7da364bed908c9eb6ba97b92895490e2b63aec9c))

## [0.6.3](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.2...v0.6.3) (2026-09-15)


### Bug Fixes

* **release:** never let verify-current-release-branch skip ([6bde922](https://github.com/pruthvi145/pipeline-sandbox/commit/6bde922305378e61ecf0b8239cb4073f78f39314))


### Maintenance

* **release:** remove temporary release-please output debug step ([5872f52](https://github.com/pruthvi145/pipeline-sandbox/commit/5872f5218533c092effe1590783262cccd8c92ae))

## [0.6.2](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.1...v0.6.2) (2026-09-15)


### Bug Fixes

* trigger a release for debug output capture ([1a7ae96](https://github.com/pruthvi145/pipeline-sandbox/commit/1a7ae961d772d370fc7cb5f3ce43383dab441bc9))

## [0.6.1](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.6.0...v0.6.1) (2026-09-15)


### Bug Fixes

* don't pass target-branch=main explicitly to release-please-action ([d1603b2](https://github.com/pruthvi145/pipeline-sandbox/commit/d1603b20bfdd2d190bde1dc51018c6f01f8920eb))

## [0.6.0](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.5.0...v0.6.0) (2026-09-15)


### Features

* add Discord notifications for demo/hotfix/production deploys ([f8a0332](https://github.com/pruthvi145/pipeline-sandbox/commit/f8a0332531189cc44a2e3428764c98f09adfafc6))
* add manual redeploy-to-demo workflow, matching production's redeploy ([c9aed9b](https://github.com/pruthvi145/pipeline-sandbox/commit/c9aed9bc33a3b6aad869dd85d3b96c9346eadbf6))
* add npm run hotfix:start, remove CI-created release branches ([f542a1b](https://github.com/pruthvi145/pipeline-sandbox/commit/f542a1b44a16049f50318dbfff3403a2355f2067))
* delete superseded release branch after production promote ([39d9678](https://github.com/pruthvi145/pipeline-sandbox/commit/39d96780d54ded092cf695d9796a730672018003))
* **release-please:** merge hotfix workflow into release-please.yaml ([4162cc6](https://github.com/pruthvi145/pipeline-sandbox/commit/4162cc6e6ee8583bdb5757c4a1ce19720b4d1b04))
* revert manifest and delete tag+release on failed hotfix ([f83dc6a](https://github.com/pruthvi145/pipeline-sandbox/commit/f83dc6a052437286cc532941de01b5bd2a2d6c04))
* snapshot production DB to R2 before every production migration ([d1ad0b9](https://github.com/pruthvi145/pipeline-sandbox/commit/d1ad0b90db8000c0f9da52971ef1d3dae5745deb))


### Refactoring

* extract downgrade/branch/manifest logic into scripts/ci ([0150c86](https://github.com/pruthvi145/pipeline-sandbox/commit/0150c869ad43cb8e5d92ad5d543e3fdf9faad281))


### Maintenance

* backport hotfix v0.5.1 to main ([#17](https://github.com/pruthvi145/pipeline-sandbox/issues/17)) ([6590b6c](https://github.com/pruthvi145/pipeline-sandbox/commit/6590b6c83aa8013247cec93066359298a84cdbdf))

## [0.5.0](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.4.0...v0.5.0) (2026-09-11)


### Features

* add hotfix pipeline (release/vX.Y.Z branches) ([#9](https://github.com/pruthvi145/pipeline-sandbox/issues/9)) ([018b1f1](https://github.com/pruthvi145/pipeline-sandbox/commit/018b1f1a8e3b90a53b82967ce9d0f160ce6c2f32))
* show environment/version/commit badge on every page ([#11](https://github.com/pruthvi145/pipeline-sandbox/issues/11)) ([6b93f3a](https://github.com/pruthvi145/pipeline-sandbox/commit/6b93f3ab128c84b967b084509fc522eefd76b547))

## [0.4.0](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.3.0...v0.4.0) (2026-09-10)


### Features

* add development environment, deployed on every push to main ([#8](https://github.com/pruthvi145/pipeline-sandbox/issues/8)) ([d27cffd](https://github.com/pruthvi145/pipeline-sandbox/commit/d27cffd33090d17d241fd1ce8eb9f3b70117ccaa))
* rebuild sandbox as app-code-only rollback (PR [#1684](https://github.com/pruthvi145/pipeline-sandbox/issues/1684) cancelled) ([11fd865](https://github.com/pruthvi145/pipeline-sandbox/commit/11fd865aba64f031c70165d0bfdb084c013265b3))


### Bug Fixes

* add always() to find-deployment and mark-stable ([954d011](https://github.com/pruthvi145/pipeline-sandbox/commit/954d01101f6e5553157fa1af21a7368cd3678133))
* skip-cascade propagates through the whole chain, not just one hop ([637e40e](https://github.com/pruthvi145/pipeline-sandbox/commit/637e40e74cda401603d5379e5528fd030c255493))


### Refactoring

* drastically simplify application-code-rollback ([914bff4](https://github.com/pruthvi145/pipeline-sandbox/commit/914bff4f37991617ef258ac4e854f90f63bd3779))
* drastically simplify application-code-rollback ([#6](https://github.com/pruthvi145/pipeline-sandbox/issues/6)) ([2c13089](https://github.com/pruthvi145/pipeline-sandbox/commit/2c1308984123d5d37eb4c2dfad078954275458f7))
* rename rollback.yaml to application-code-rollback.yaml, matching totalfamily/app PR [#1670](https://github.com/pruthvi145/pipeline-sandbox/issues/1670) ([ee23e27](https://github.com/pruthvi145/pipeline-sandbox/commit/ee23e277dd39eb3879b6faa8978a2c03c318af04))


### Tests

* match application-code-rollback.yaml exactly to PR [#1670](https://github.com/pruthvi145/pipeline-sandbox/issues/1670) ([#7](https://github.com/pruthvi145/pipeline-sandbox/issues/7)) ([f3fc52e](https://github.com/pruthvi145/pipeline-sandbox/commit/f3fc52e73403ab83bcea35bb5789e8866b1c4eaa))

## [0.3.0](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.2.2...v0.3.0) (2026-09-09)


### Features

* add notes field to todos ([991fe18](https://github.com/pruthvi145/pipeline-sandbox/commit/991fe18273b628f4b3f0be76e880f70b84ef69e4))

## [0.2.2](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.2.1...v0.2.2) (2026-09-09)


### Bug Fixes

* revert network-window actions to match TF exactly, remove sandbox-only toggle ([11df357](https://github.com/pruthvi145/pipeline-sandbox/commit/11df357ac8d3f4b0ff18dad4b280f0b25a37bf05))

## [0.2.1](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.2.0...v0.2.1) (2026-09-09)


### Bug Fixes

* composite actions can't read vars.* directly, thread manage-network-window as an input ([1902f0c](https://github.com/pruthvi145/pipeline-sandbox/commit/1902f0c863153ac897c25044550828224568589b))

## [0.2.0](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.1.0...v0.2.0) (2026-09-09)


### Features

* minimal todo app + CI/CD pipeline sandbox ([476a9e2](https://github.com/pruthvi145/pipeline-sandbox/commit/476a9e2b5f0444fa80ec3893e3b2d842ac062b8c))


### Maintenance

* add release-please workflow to sandbox ([784d56a](https://github.com/pruthvi145/pipeline-sandbox/commit/784d56ac224b002889ef1ddae8bd46ac32d679f1))
* ignore tsc incremental build artifact ([be232c0](https://github.com/pruthvi145/pipeline-sandbox/commit/be232c001187383996687fde7b51795ca49c26d7))


### Documentation

* clarify Vercel env vars go in dashboard, not GitHub secrets ([e217295](https://github.com/pruthvi145/pipeline-sandbox/commit/e217295cbea0f1e1bafef46ca616311d9ec21816))
* exact setup steps for Vercel/Supabase/R2/GitHub wiring + test procedure ([814768b](https://github.com/pruthvi145/pipeline-sandbox/commit/814768bdccc51019c0ae979e08dc584735881c33))
* keep Network Restrictions on for a faithful test, wire baseline CIDR ([ff14774](https://github.com/pruthvi145/pipeline-sandbox/commit/ff14774e8d1902abb147a7be7d2211ffd068a484))
