<template>
  <div class="demo demo-resonance-hud">
    <div class="hud">
      <div class="hud__titlebar">
        <span class="hud__diamond" aria-hidden="true"></span>
        <span class="hud__titles">
          <b>共鸣 HUD</b>
          <i>RESONANCE · DESIGN LANGUAGE</i>
        </span>
        <span class="hud__live"><u aria-hidden="true"></u>LIVE</span>
      </div>

      <div class="hud__head">
        <h4>深色金调 · 游戏界面</h4>
        <p>DARK GOLD · ZERO ASSET · SHARP AT ANY DPI</p>
      </div>

      <div class="hud__seg" style="--i: 1">
        <span>面板</span><span>令牌</span><span>装饰</span>
        <u class="hud__seg-ind" aria-hidden="true"></u>
      </div>

      <div class="hud__divider" aria-hidden="true"></div>

      <button class="hud__cta" type="button">
        <i class="hud__ck hud__ck--tl" aria-hidden="true"></i>
        <i class="hud__ck hud__ck--tr" aria-hidden="true"></i>
        <i class="hud__ck hud__ck--bl" aria-hidden="true"></i>
        <i class="hud__ck hud__ck--br" aria-hidden="true"></i>
        <span>查看源码</span>
        <em>GITHUB · KTBOY</em>
      </button>

      <div class="hud__foot">
        <s aria-hidden="true"></s><span>PURE CSS · NO IMAGE · NO WEB FONT</span><s aria-hidden="true"></s>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 42%, #17191e 0%, #0e1013 74%);
}

.hud {
  --gold: #d9b45c;
  --gold-bright: #e6cf95;
  --gold-dim: rgba(201, 172, 103, 0.62);
  --cream: #fafae9;
  --cream-dim: rgba(250, 250, 233, 0.55);
  --hair: rgba(201, 172, 103, 0.22);
  width: min(380px, 88%);
  padding: 12px 16px;
  background: #14161a;
  border: 1px solid var(--hair);
  box-shadow: 0 18px 44px -18px rgba(0, 0, 0, 0.8);
}

/* 标题栏：菱形 + 双语标题 + 状态灯 */
.hud__titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hud__diamond {
  width: 5px;
  height: 5px;
  background: var(--gold);
  transform: rotate(45deg);
  box-shadow: 0 0 6px rgba(217, 180, 92, 0.7);
}
.hud__titles {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hud__titles b {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--cream);
}
.hud__titles i {
  font-style: normal;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 2.4px;
  color: var(--gold-dim);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hud__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--cream-dim);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hud__live u {
  width: 4px;
  height: 4px;
  background: #6ee7a0;
  transform: rotate(45deg);
  box-shadow: 0 0 6px #6ee7a0;
  animation: live-pulse 1.8s ease-in-out infinite;
}
@keyframes live-pulse {
  50% {
    opacity: 0.3;
  }
}

/* 页头：大标题 + 拉丁副题 */
.hud__head {
  margin-top: 10px;
}
.hud__head h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--cream);
}
.hud__head p {
  margin: 4px 0 0;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 3px;
  color: var(--gold);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* 分段控件：金色下划线指示器，由 --i 驱动 */
.hud__seg {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 12px;
  border: 1px solid var(--hair);
}
.hud__seg span {
  padding: 6px 0;
  text-align: center;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--cream-dim);
}
.hud__seg span:nth-child(2) {
  color: var(--gold-bright);
  font-weight: 600;
  background: rgba(217, 180, 92, 0.08);
}
.hud__seg-ind {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: calc(100% / 3);
  height: 2px;
  background: var(--gold);
  box-shadow: 0 0 8px rgba(217, 180, 92, 0.55);
  transform: translateX(calc(var(--i, 0) * 100%));
}

/* 发丝分隔线 + 中心菱形节点 */
.hud__divider {
  position: relative;
  height: 1px;
  margin: 13px 0 11px;
  background: linear-gradient(90deg, transparent, var(--hair) 18% 82%, transparent);
}
.hud__divider::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  background: #14161a;
  border: 1px solid var(--gold-dim);
  transform: translate(-50%, -50%) rotate(45deg);
}

/* CTA：直角面板 + 四角括号，hover 时括号外扩 */
.hud__cta {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px 0;
  border: 1px solid var(--hair);
  background: linear-gradient(180deg, #23242a, #15171b);
  color: var(--gold-bright);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: box-shadow 0.25s ease;
}
.hud__cta:hover {
  box-shadow: 0 10px 26px -12px rgba(217, 180, 92, 0.45);
}
.hud__cta em {
  font-style: normal;
  font-size: 7.5px;
  letter-spacing: 3px;
  color: var(--gold-dim);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hud__ck {
  position: absolute;
  width: 7px;
  height: 7px;
  border: 1.5px solid var(--gold);
  transition: transform 0.25s ease;
}
.hud__ck--tl {
  top: -4px;
  left: -4px;
  border-right: 0;
  border-bottom: 0;
}
.hud__ck--tr {
  top: -4px;
  right: -4px;
  border-left: 0;
  border-bottom: 0;
}
.hud__ck--bl {
  bottom: -4px;
  left: -4px;
  border-right: 0;
  border-top: 0;
}
.hud__ck--br {
  bottom: -4px;
  right: -4px;
  border-left: 0;
  border-top: 0;
}
.hud__cta:hover .hud__ck--tl {
  transform: translate(-2px, -2px);
}
.hud__cta:hover .hud__ck--tr {
  transform: translate(2px, -2px);
}
.hud__cta:hover .hud__ck--bl {
  transform: translate(-2px, 2px);
}
.hud__cta:hover .hud__ck--br {
  transform: translate(2px, 2px);
}

/* 页脚：点线 + 小字 */
.hud__foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 11px;
}
.hud__foot span {
  font-size: 8px;
  line-height: 1;
  letter-spacing: 2px;
  color: var(--cream-dim);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hud__foot s {
  width: 14px;
  height: 1px;
  background: var(--hair);
}
</style>
