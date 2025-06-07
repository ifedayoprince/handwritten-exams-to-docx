@echo off
echo Starting Next.js in production mode...

:: Start the server in the background
start /B pnpm start

:: Wait for the server to be available (up to 30 seconds)
set /a attempts=0
:wait_loop
timeout /t 2 /nobreak >nul
set /a attempts+=1
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 goto server_ready
if %attempts% lss 15 goto wait_loop
echo Error: Server failed to start within 30 seconds
goto end

:server_ready
echo Server is ready!
start http://localhost:3000

:: Create and open the DOCX directory
if not exist "%USERPROFILE%\Downloads\Handwritexam\DOCX" mkdir "%USERPROFILE%\Downloads\Handwritexam\DOCX"
if not exist "%USERPROFILE%\Downloads\Handwritexam\Markdown" mkdir "%USERPROFILE%\Downloads\Handwritexam\Markdown"
start explorer.exe "%USERPROFILE%\Downloads\Handwritexam\DOCX"

:end
