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
echo [1/5] typecheck...
call pnpm typecheck || goto :fail
echo [2/5] lint...
call pnpm lint || goto :fail
echo [3/5] 构建组件库...
call pnpm build || goto :fail
echo [4/5] 构建文档站...
call pnpm docs:build || goto :fail
echo [5/5] 组件信息同步检查（README 组件表 / 文档页 / 侧边栏）...
node scripts/check-components.mjs || goto :fail
echo.
echo 全部检查通过。
echo.

REM ---------- 4. 提交并推送 ----------
REM 先暂存全部改动；若没有新改动（如上次已 commit 但未 push）则跳过提交直接推送
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo 没有新改动需要提交，直接推送本地已有提交...
  goto :push
)
echo 即将提交以下改动，git add -A 已包含所有新文件，
echo 防止"文档引用了某个新文件但忘了提交"导致 CI 挂掉：
echo ------------------------------------------
git status --short
echo ------------------------------------------
choice /m "确认全部加入并提交推送吗？请先确认上面没有不想提交的临时文件"
if errorlevel 2 goto :end

set /p MSG=请输入提交信息: 
if "%MSG%"=="" set MSG=chore: update

git commit -m "%MSG%" || goto :fail
:push
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
echo tag v%VER% 已推送，后面全自动，无需任何手动操作：
echo   CI 会自动构建并发布 npm（OIDC 免验证码），发布成功后自动创建 GitHub Release。
echo   可在 Actions 页面观察进度（约 1 分钟），完成后 npm 上即可搜到新版本。
start "" "https://github.com/KTBOY/sh-design/actions/workflows/publish-npm.yml"
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
