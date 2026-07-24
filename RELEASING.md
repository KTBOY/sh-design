# 发布指南（Releasing）

本文档说明如何将 **sh-design** 发布到 npm，包含手动发布与自动发布两种方式，以及本项目特有的注意事项（2FA、镜像源等）。

> 维护者文档。普通使用者请看 [README](./README.md) 或 [文档站](https://ktboy.github.io/sh-design/)。

## 前置条件

- Node.js >= 18（本项目使用 v22）
- pnpm >= 8（本项目使用 v11）
- 拥有 npm 包 `sh-design` 的发布权限（账户 `shukezlc`）
- 已构建可通过：`pnpm build`、`pnpm lint`、`pnpm typecheck`

## 关于 registry（重要）

本机全局 registry 指向淘宝镜像 `https://registry.npmmirror.com`，**该镜像只读、不能发布**。

无需手动切换：`packages/sh-design/package.json` 里的 `publishConfig` 已强制把发布目标指向官方源：

```json
"publishConfig": {
  "access": "public",
  "registry": "https://registry.npmjs.org/"
}
```

发布前确认已登录**官方源**：

```powershell
npm whoami --registry=https://registry.npmjs.org
# 未登录则执行：
npm login --registry=https://registry.npmjs.org
```

---

## 一、手动发布（本地）

标准三步：**改代码 → 升版本号 → 发布**

```powershell
# 1. 改代码（并确保通过校验）
pnpm lint
pnpm typecheck
pnpm build

# 2. 升版本号（在组件库目录内执行）
cd d:\my\git\sh-ui\packages\sh-design
npm version patch        # 0.0.1 → 0.0.2（feature 用 minor，破坏性改动用 major）

# 3. 发布（发布前会自动执行 prepublishOnly 重新构建 dist）
npm publish --otp=<一个恢复码或 6 位验证码>
```

发布成功后，把版本提交与 tag 推到 GitHub：

```powershell
cd d:\my\git\sh-ui
git push --follow-tags
```

### ⚠️ 关于 2FA / OTP（本项目的坑）

当前 npm 账户开启了**双因素认证（2FA）且使用安全密钥 / passkey**，因此：

- **`pnpm publish --otp=...` 会失败**，报 `ERR_PNPM_OTP_NON_INTERACTIVE`（pnpm 在非交互终端下无法完成安全密钥验证）。
- **请改用原生 `npm publish`**，并通过 `--otp=` 传入：
  - 验证器 App 的 **6 位验证码**，或
  - 一个**恢复码**（在启用 2FA 时生成的备份码，一次性使用）。
- 恢复码用一个少一个，且属于敏感凭据，**不要提交到仓库或粘贴到公开场合**；如已暴露，去 npmjs.com 重新生成一组。

---

## 二、自动发布（推荐：Trusted Publishing / OIDC）

采用 npm 的可信发布（Trusted Publishing）：GitHub Actions 通过 OIDC 短期身份直接发布，**无需保存任何 NPM_TOKEN 密钥**，并自动附带发布溯源（provenance）。仅需一次性配置。

### 1. 在 npm 配置可信发布者（一次性）

登录 npmjs.com → 打开 `sh-design` 包的 **Settings** → 找到 **Trusted Publisher / 可信发布者** → 选择 **GitHub Actions**，填写：

- Organization or user：`KTBOY`
- Repository：`sh-design`
- Workflow filename：`publish-npm.yml`
- Environment：留空

保存即可。

### 2. 工作流已就绪

[`.github/workflows/publish-npm.yml`](./.github/workflows/publish-npm.yml) 已配置为 OIDC 发布：`id-token: write` 权限 + 升级 npm 到最新 + `npm publish`，**无需任何密钥，也无需改动**。

### 3. 发版

```powershell
# 升版本号并推送 tag
cd d:\my\git\sh-ui\packages\sh-design
npm version patch
cd d:\my\git\sh-ui
git push --follow-tags
```

然后在 GitHub 仓库 **Releases → Draft a new release** 选中该 tag 发布。发布后，[`.github/workflows/publish-npm.yml`](./.github/workflows/publish-npm.yml) 会自动安装依赖、构建并通过 OIDC 完成 `npm publish`（无需令牌）。

---

## 版本号规范（SemVer）

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`

| 类型 | 命令 | 场景 |
| --- | --- | --- |
| patch | `npm version patch` | 修复 Bug，无 API 变化（0.0.1 → 0.0.2） |
| minor | `npm version minor` | 新增组件 / 向后兼容的功能（0.1.0 → 0.2.0） |
| major | `npm version major` | 破坏性变更（1.0.0 → 2.0.0） |

> 处于 `0.x` 阶段时 API 视为不稳定，可较灵活地使用 minor 承载新功能。

---

## 发布后验证

```powershell
# 查看线上信息
npm view sh-design --registry=https://registry.npmjs.org

# 在临时目录中试装（可选）
npm install sh-design --registry=https://registry.npmjs.org
```

同时确认 npm 包页面正常：https://www.npmjs.com/package/sh-design

---

## 发布检查清单

- [ ] `pnpm lint` / `pnpm typecheck` / `pnpm build` 全部通过
- [ ] 更新了对应组件的文档页（`docs/components/`）
- [ ] 按 SemVer 正确升级了版本号
- [ ] `npm publish` 成功（或 GitHub Release 触发的工作流成功）
- [ ] `git push --follow-tags` 已推送版本提交与 tag
- [ ] `npm view sh-design` 显示新版本
