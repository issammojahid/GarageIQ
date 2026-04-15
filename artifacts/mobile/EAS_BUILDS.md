# EAS Build History

## v2.5.7 — Build #11 — IN_QUEUE (Play Store AAB)
- **Date**: 2026-04-15
- **Profile**: production (AAB — Android App Bundle)
- **Platform**: Android
- **versionCode**: 8
- **Build ID**: 15d6d64e-4c20-42ad-adb9-1bd69ce6ac46
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/15d6d64e-4c20-42ad-adb9-1bd69ce6ac46
- **Status**: IN_QUEUE ⏳
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Purpose**: Play Store update — includes corrected AdMob ad unit IDs (Task #31)
- **Keystore**: TQ7nSrhNPq (default, remote)

## v2.5.6 — Build #10 — IN_QUEUE (Play Store AAB)
- **Date**: 2026-04-14
- **Profile**: production (AAB — Android App Bundle)
- **Platform**: Android
- **versionCode**: 7
- **Build ID**: 71c65844-541e-446b-b89d-1ef10921153c
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/71c65844-541e-446b-b89d-1ef10921153c
- **Status**: IN_QUEUE ⏳
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Purpose**: Play Store update submission
- **Keystore**: TQ7nSrhNPq (default, remote)

## v2.5.6 — Build #9 (Task #29) — IN_QUEUE
- **Date**: 2026-04-14
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: 8c4c0d2a-d9e8-4e3e-8b44-898217789797
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/8c4c0d2a-d9e8-4e3e-8b44-898217789797
- **Status**: IN_QUEUE ⏳
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Config**: `newArchEnabled: true`, `react-native-worklets@0.8.1` (upgraded from 0.5.1), safe AdMob init
- **Crash fix**: Upgraded worklets 0.5.1→0.8.1 (JSI ABI incompatibility with RN 0.81.5)
- **Crash fix**: Moved `admob.initialize()` from module scope into component `useEffect`
- **Safety**: Added global `ErrorUtils` handler to log all errors without changing RN default behavior

## v2.5.5 — Build #8 (Task #27) — CRASH ON LAUNCH
- **Date**: 2026-04-14
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: 14a82e93-9f43-4ce6-b4e8-045a7428b206
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/14a82e93-9f43-4ce6-b4e8-045a7428b206
- **Status**: FINISHED ✅ but crashes on launch ❌
- **Root cause**: `react-native-worklets@0.5.1` JSI ABI incompatible with RN 0.81.5; `admob.initialize()` called at module scope
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Config**: `newArchEnabled: true`, `react-native-worklets@0.5.1`, `expo-glass-effect` removed

## v2.5.5 — Build #7 (Task #25/#26) — ERRORED (New Arch required)
- **Date**: 2026-04-14
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: 776263d5-3b2c-4adc-ab59-760f52a42d60
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/776263d5-3b2c-4adc-ab59-760f52a42d60
- **Status**: ERRORED ❌
- **Error**: `react-native-reanimated@4.x` and `react-native-worklets@0.5.x` both require `newArchEnabled: true` — they assert this in Gradle and FAIL the build if New Arch is off
- **Fix (Task #26)**: Reverted `newArchEnabled: true` in app.json; New Arch is mandatory for these packages

## v2.5.5 — Build #6 (Task #25) — CANCELED
- **Date**: 2026-04-14
- **Build ID**: 5240ed17-0694-4a0f-8498-3181f17551a3
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/5240ed17-0694-4a0f-8498-3181f17551a3
- **Status**: CANCELED

## v2.5.5 — Build #5 (Task #24) — ERRORED (Metro bundling)
- **Date**: 2026-04-14
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: 89709d7a-0866-4288-b392-d3769e0900a4
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/89709d7a-0866-4288-b392-d3769e0900a4
- **Status**: ERRORED ❌
- **Error**: `Cannot find module 'react-native-worklets/plugin'` — react-native-reanimated@4.x Babel plugin requires react-native-worklets at compile time; removing it from direct deps broke bundling
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Code changes**: `newArchEnabled: false`, removed `expo-glass-effect` (unused)
- **Next**: Task #25 restores `react-native-worklets` to devDependencies and queues Build #6

## v2.5.5 — Build #4 (Task #23) — STABLE
- **Date**: 2026-04-13
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: 2fef4b9e-1bda-4aa1-9c15-ae14bef80c51
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/2fef4b9e-1bda-4aa1-9c15-ae14bef80c51
- **Status**: FINISHED ✅
- **APK Download**: https://expo.dev/artifacts/eas/6Vj9pSSLRa542jdARLTxak.apk
- **Completed**: 2026-04-13T23:47:35Z
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Packages**: expo-image-manipulator ~14.0.8, react-native-keyboard-controller ~1.18.5, react-native-webview 13.15.0

## v2.5.5 — Build #3 (Task #21) — CRASH FIX
- **Date**: 2026-04-13
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build ID**: f090dabc-6f10-4f30-9fbd-a85c1222a6de
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/f090dabc-6f10-4f30-9fbd-a85c1222a6de
- **Status**: CANCELED
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Fix**: Downgraded `expo-image-manipulator` 55.0.15→14.0.8, `react-native-keyboard-controller` 1.21.1→1.18.5, `react-native-webview` 13.16.1→13.15.0

## v2.5.5 — Build #2 (Task #18)
- **Date**: 2026-04-13
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/902a1b22-9535-427f-870e-2e38132afeb4
- **Status**: Queued (free tier, ~160 min)
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app
- **Keystore**: TQ7nSrhNPq (default, remote)

## v2.5.5 — Build #1 (Task #14)
- **Date**: 2026-04-10
- **Profile**: preview (APK)
- **Platform**: Android
- **versionCode**: 6
- **Build URL**: https://expo.dev/accounts/aisoteam/projects/mobile/builds/40cc79db-801e-436a-b76f-2c7bc0670f34
- **EXPO_PUBLIC_DOMAIN**: workspaceapi-server-production-02f4.up.railway.app (obsolete build)
