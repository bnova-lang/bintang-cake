@echo off
title Push Bintang Cake to GitHub
echo ========================================================
echo   Mengunggah Bintang Cake ^& Cookies ke GitHub
echo   Repository: https://github.com/bungnova-bn/Bintang-Cake
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUKSES] Seluruh kode toko berhasil diunggah ke GitHub!
) else (
    echo [INFO] Jika diminta otentikasi, silakan login ke akun GitHub Anda di browser atau masukkan Personal Access Token.
)
echo.
pause
