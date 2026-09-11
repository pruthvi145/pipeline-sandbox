# Changelog

## [0.5.1](https://github.com/pruthvi145/pipeline-sandbox/compare/v0.5.0...v0.5.1) (2026-09-11)


### Bug Fixes

* second trivial hotfix test change ([#16](https://github.com/pruthvi145/pipeline-sandbox/issues/16)) ([4dedd0f](https://github.com/pruthvi145/pipeline-sandbox/commit/4dedd0fd6c9126a205e7eab6e1a99b8795e3f15a))
* trivial hotfix test change ([#12](https://github.com/pruthvi145/pipeline-sandbox/issues/12)) ([2b035cf](https://github.com/pruthvi145/pipeline-sandbox/commit/2b035cfc16bb2c7a992e8d9544a2801b93eb41f9))

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
