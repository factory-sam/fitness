# Changelog

## [0.1.4](https://github.com/factory-sam/fitness/compare/vitruvian-v0.1.3...vitruvian-v0.1.4) (2026-04-12)


### Features

* add Vercel Analytics and Speed Insights ([f4c2c66](https://github.com/factory-sam/fitness/commit/f4c2c66b09608269581d4492c1c8ad2829c2831f))
* add Vercel Analytics and Speed Insights ([ad27213](https://github.com/factory-sam/fitness/commit/ad2721313bbcff2cded8878c831eda5fd2d3c6ff))


### Bug Fixes

* address droid review feedback and CI build failure ([baef645](https://github.com/factory-sam/fitness/commit/baef6451a91bcc9f436a5f79eb3589176045612e))
* await posthog.isFeatureEnabled before nullish coalescing ([9bcdd1c](https://github.com/factory-sam/fitness/commit/9bcdd1cb19d1944b3b8ce93036dfd564aecde9de))
* improve agent readiness across 10 signals ([ed76a33](https://github.com/factory-sam/fitness/commit/ed76a3342367e3b5095f4e4cc29e0904b8a31924))
* improve agent readiness across 10 signals ([f47ff52](https://github.com/factory-sam/fitness/commit/f47ff520d024284ffbadf153eb786573b9f9afd0))
* resolve remaining droid review feedback ([724ef48](https://github.com/factory-sam/fitness/commit/724ef48d23b8c2a42183e0e5cd95978e67086cfc))

## [0.1.3](https://github.com/factory-sam/fitness/compare/vitruvian-v0.1.2...vitruvian-v0.1.3) (2026-04-12)


### Features

* add ai_sessions and ai_insights tables with RLS ([#15](https://github.com/factory-sam/fitness/issues/15)) ([#38](https://github.com/factory-sam/fitness/issues/38)) ([e7373d7](https://github.com/factory-sam/fitness/commit/e7373d7c982339e0c1f0b553dd1b69c2d6cfc721))
* add InsightCards component to dashboard ([#28](https://github.com/factory-sam/fitness/issues/28)) ([#60](https://github.com/factory-sam/fitness/issues/60)) ([10e0bef](https://github.com/factory-sam/fitness/commit/10e0bef3f1a6911e84c3d7b838f66eb2505fc461))
* add notification API routes ([#36](https://github.com/factory-sam/fitness/issues/36)) ([#62](https://github.com/factory-sam/fitness/issues/62)) ([7ef49be](https://github.com/factory-sam/fitness/commit/7ef49beefba21e64e97a92e586e6f0f71224c02e))
* add quick action slash commands to chat ([#23](https://github.com/factory-sam/fitness/issues/23)) ([#47](https://github.com/factory-sam/fitness/issues/47)) ([1b0131b](https://github.com/factory-sam/fitness/commit/1b0131bee993ea92d551a7d650e1f81ab449f71f))
* add session planner and post-workout analysis prompts ([#25](https://github.com/factory-sam/fitness/issues/25), [#26](https://github.com/factory-sam/fitness/issues/26)) ([8ff0054](https://github.com/factory-sam/fitness/commit/8ff005455671b6d60afe5c9a552935f4bb71b6c3))
* AI Foundation -- Droid SDK, MCP tools, chat & insights API ([95ae50b](https://github.com/factory-sam/fitness/commit/95ae50b2cc3e026b79244874a6acd4ceaed8fb8e))
* build collapsible chat sidebar with SSE streaming ([#21](https://github.com/factory-sam/fitness/issues/21)) ([#45](https://github.com/factory-sam/fitness/issues/45)) ([bc883c2](https://github.com/factory-sam/fitness/commit/bc883c20c88946409a1ea3dbb6db420870d1e5fa))
* Chat Experience -- sidebar, session history, slash commands ([860e66a](https://github.com/factory-sam/fitness/commit/860e66a0bb4ca3f882a07272868d41589975d274))
* create notification database tables and query functions ([#31](https://github.com/factory-sam/fitness/issues/31)) ([#61](https://github.com/factory-sam/fitness/issues/61)) ([d68ce91](https://github.com/factory-sam/fitness/commit/d68ce91aff4c0c89d241859a4db46ea76cb94eba))
* deploy send-reminders Edge Function ([#34](https://github.com/factory-sam/fitness/issues/34)) ([#65](https://github.com/factory-sam/fitness/issues/65)) ([fcf003c](https://github.com/factory-sam/fitness/commit/fcf003cbe000c52a5536ee4265970a72637748a0))
* enrich insight prompt with plateau detection and body comp correlations ([#29](https://github.com/factory-sam/fitness/issues/29), [#30](https://github.com/factory-sam/fitness/issues/30)) ([#59](https://github.com/factory-sam/fitness/issues/59)) ([c2457d1](https://github.com/factory-sam/fitness/commit/c2457d1e7dfef9465e1a703f6e48d67df7a7f1e7))
* implement /api/ai/chat SSE streaming route ([#18](https://github.com/factory-sam/fitness/issues/18)) ([#41](https://github.com/factory-sam/fitness/issues/41)) ([0e8efe4](https://github.com/factory-sam/fitness/commit/0e8efe4428da3e566cb1d9b5a5499a1501b5cc89))
* implement /api/ai/insights route with caching ([#19](https://github.com/factory-sam/fitness/issues/19)) ([#42](https://github.com/factory-sam/fitness/issues/42)) ([fe378fa](https://github.com/factory-sam/fitness/commit/fe378fae43fe527f2ecd7849d5861c936a19ab28))
* implement /api/ai/parse-workout route ([#27](https://github.com/factory-sam/fitness/issues/27)) ([#54](https://github.com/factory-sam/fitness/issues/54)) ([87053fb](https://github.com/factory-sam/fitness/commit/87053fb42052ec1a8dff05e028d842b1cfaa4f2c))
* implement chat session persistence and history ([#22](https://github.com/factory-sam/fitness/issues/22)) ([#46](https://github.com/factory-sam/fitness/issues/46)) ([7630dde](https://github.com/factory-sam/fitness/commit/7630ddeb97dce22e1f078cedabbc40d58832f869))
* implement read MCP tools for AI agent ([#16](https://github.com/factory-sam/fitness/issues/16)) ([#39](https://github.com/factory-sam/fitness/issues/39)) ([03218c4](https://github.com/factory-sam/fitness/commit/03218c4ee653367cdb2a17251bdd54794836bc51))
* implement write MCP tools for AI agent ([#17](https://github.com/factory-sam/fitness/issues/17)) ([#40](https://github.com/factory-sam/fitness/issues/40)) ([55d8ee1](https://github.com/factory-sam/fitness/commit/55d8ee16baaa8da7bed5db0bd2d5d2807965461a))
* install @factory/droid-sdk and scaffold AI module ([#20](https://github.com/factory-sam/fitness/issues/20)) ([#37](https://github.com/factory-sam/fitness/issues/37)) ([c06ec59](https://github.com/factory-sam/fitness/commit/c06ec59fc9faaf9dfec5833a37f671b448a3ea66))
* integrate PostHog analytics, feature flags & experiments ([#50](https://github.com/factory-sam/fitness/issues/50)) ([#51](https://github.com/factory-sam/fitness/issues/51)) ([409a179](https://github.com/factory-sam/fitness/commit/409a17902d5b1b03aeebf522e3dccb11c72b9241))
* natural language workout logging ([#24](https://github.com/factory-sam/fitness/issues/24)) ([#55](https://github.com/factory-sam/fitness/issues/55)) ([b76b237](https://github.com/factory-sam/fitness/commit/b76b237ab54942dbae8b373ea5fc60cebf72931c))
* notification preferences UI page ([#33](https://github.com/factory-sam/fitness/issues/33)) ([#64](https://github.com/factory-sam/fitness/issues/64)) ([db53893](https://github.com/factory-sam/fitness/commit/db5389319a7f375539748ba3a52bc780e619c249))
* Phase 2 — AI Foundation, Chat, Core Use Cases, Automated Insights (M1-M4) ([df48d6e](https://github.com/factory-sam/fitness/commit/df48d6e73259881f515048a157dea9b0addb43e4))
* set up pg_cron scheduling and switch to in-app notifications ([#35](https://github.com/factory-sam/fitness/issues/35)) ([#66](https://github.com/factory-sam/fitness/issues/66)) ([633a830](https://github.com/factory-sam/fitness/commit/633a83078c21b5f783fe7e6714a2a8be2231ccdd))
* Web Push service worker and subscription flow ([#32](https://github.com/factory-sam/fitness/issues/32)) ([#63](https://github.com/factory-sam/fitness/issues/63)) ([c80f8df](https://github.com/factory-sam/fitness/commit/c80f8dfa0eee8e3733bc836739a8246a62ab01ea))


### Bug Fixes

* exclude supabase Edge Functions from tsc check ([54e2a96](https://github.com/factory-sam/fitness/commit/54e2a9606d4ac5c708636c8d90ee08db033096d6))
* resolve chat sidebar hydration mismatch ([385b0e1](https://github.com/factory-sam/fitness/commit/385b0e14524937a1434b38af76b102c9fdcc54d9))
* resolve PR [#49](https://github.com/factory-sam/fitness/issues/49) review comments and CI failure ([486003e](https://github.com/factory-sam/fitness/commit/486003e7c508192e6059cce9f6d48f3edd32b5cf))

## [0.1.2](https://github.com/factory-sam/fitness/compare/vitruvian-v0.1.1...vitruvian-v0.1.2) (2026-04-12)


### Bug Fixes

* use local timezone for all date calculations ([e199842](https://github.com/factory-sam/fitness/commit/e19984245a64f7876c80ca41bbc338f291c83c46))
* Use local timezone for all date calculations ([b33cc7b](https://github.com/factory-sam/fitness/commit/b33cc7ba919feffddf97fdd7725451f65b7707fe))

## [0.1.1](https://github.com/factory-sam/fitness/compare/vitruvian-v0.1.0...vitruvian-v0.1.1) (2026-04-12)


### Bug Fixes

* replace RouteContext with standard params type in sessions/[id] route ([0eb8f4e](https://github.com/factory-sam/fitness/commit/0eb8f4e060bfb8403b6c2fdbc5f4e8557c40bb2a))
