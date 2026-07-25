@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo    sh-design 提交 / 发布助手
echo ==========================================
echo.

REM ---------- 0. 环境检查：pnpm 11.7+ 需要 Node ^>= 22.13 ----------
node -e "const[M,m]=process.versions.node.split('.').map(Number);process.exit(M>22||(M===22&&m>=13)?0:1)" 2>nul
if errorlevel 1 (
  echo [错误] Node 版本过低：pnpm 11.7+ 需要 Node ^>= 22.13，请先切换 Node 版本。
  goto :fail
)

REM ---------- 1. 读取当前版本号 ----------
for /f "delims=" %%v in ('node -p "require('./packages/sh-design/package.json').version"') do set VER=%%v
echo 当前版本：v%VER%
echo 提示：发新版请先手动改 packages/sh-design/package.json 的 version，
echo       src/version.ts 会在构建时由 sync-version.mjs 自动同步，不用手改。
echo.

REM ---------- 2. 更新日志检查（组件有改动必须更新 docs/guide/changelog.md）----------
findstr /c:"## %VER%" docs\guide\changelog.md >nul 2>&1
if errorlevel 1 (
  echo [提醒] docs/guide/changelog.md 中没有 "## %VER%" 条目。
  choice /m "组件有改动时必须补更新日志，仍要继续吗"
  if errorlevel 2 goto :end
)

REM ---------- 3. 本地验证（和 CI 同款，全过再提交，避免推上去才红）----------
echo [1/4] typecheck...
call pnpm typecheck || goto :fail
echo [2/4] lint...
call pnpm lint || goto :fail
echo [3/4] 构建组件库...
call pnpm build || goto :fail
echo [4/4] 构建文档站...
call pnpm docs:build || goto :fail
echo.
echo 全部检查通过。
echo.

REM ---------- 4. 提交并推送 ----------
echo 即将提交以下改动，git add -A 会包含所有新文件，
echo 防止"文档引用了某个新文件但忘了提交"导致 CI 挂掉：
echo ------------------------------------------
git status --short
echo ------------------------------------------
choice /m "确认全部加入并提交推送吗？请先确认上面没有不想提交的临时文件"
if errorlevel 2 goto :end

set /p MSG=请输入提交信息: 
if "%MSG%"=="" set MSG=chore: update

git add -A
git commit -m "%MSG%" || goto :fail
git push origin main || goto :fail
echo.
echo 已推送。CI 会自动构建并部署文档站：
echo   https://github.com/KTBOY/sh-design/actions
echo.

REM ---------- 5. 可选：打 tag 发版到 npm ----------
choice /m "是否发版？打 tag v%VER% 并发布 npm"
if errorlevel 2 goto :end

git rev-parse "v%VER%" >nul 2>&1
if not errorlevel 1 (
  echo [错误] tag v%VER% 已存在。请先在 package.json 升版本号后重新运行。
  goto :fail
)

git tag -a "v%VER%" -m "v%VER%"
git push origin "v%VER%" || goto :fail
echo.
echo tag v%VER% 已推送。最后一步需要你手动点一下：
echo   发布 GitHub Release 触发 npm 自动发布，OIDC 免验证码
echo   1. 填标题 v%VER%
echo   2. 点 Generate release notes
echo   3. 点 Publish release
start "" "https://github.com/KTBOY/sh-design/releases/new?tag=v%VER%"
goto :end

:fail
echo.
echo [中断] 请查看上方报错，修复后重新运行本脚本。
pause
exit /b 1

:end
echo.
echo 完成。
pause
endlocal
