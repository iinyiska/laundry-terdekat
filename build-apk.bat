@echo off
echo === Building APK with Capacitor ===

REM Backup current config
copy next.config.ts next.config.backup.ts

REM Use Capacitor config (with static export)
copy next.config.capacitor.ts next.config.ts

REM Build
call npm run build

REM Sync with Capacitor
call npx cap sync android

REM Restore original config
copy next.config.backup.ts next.config.ts
del next.config.backup.ts

REM Build APK
cd android
call gradlew.bat assembleDebug
cd ..

REM Copy APK to Desktop
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\laundry terdekat apk\LaundryTerdekat.apk"

echo === APK Build Complete ===
echo APK saved to: %USERPROFILE%\Desktop\laundry terdekat apk\LaundryTerdekat.apk
