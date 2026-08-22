<template>
  <div class="demo demo-neon-button">
    <button class="neon" type="button">HOVER&nbsp;ME</button>
  </div>
</template>

<style scoped>
.demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 42%, #14244a 0%, #090e1f 72%);
}

.neon {
  padding: 13px 32px;
  border: 1px solid rgba(34, 211, 238, 0.7);
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.05);
  color: #a5f3fc;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.24em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.95);
  box-shadow:
    inset 0 0 12px rgba(34, 211, 238, 0.35),
    0 0 18px rgba(34, 211, 238, 0.35),
    0 0 46px rgba(34, 211, 238, 0.16);
  animation: neon-breathe 2.8s ease-in-out infinite;
  cursor: pointer;
  transition: transform 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.neon:hover {
  transform: scale(1.06);
  color: #ecfeff;
  border-color: rgba(103, 232, 249, 0.95);
  box-shadow:
    inset 0 0 18px rgba(34, 211, 238, 0.65),
    0 0 28px rgba(34, 211, 238, 0.75),
    0 0 80px rgba(34, 211, 238, 0.42);
}

@keyframes neon-breathe {
  0%,
  100% {
    filter: brightness(0.92);
  }
  50% {
    filter: brightness(1.18);
  }
}
</style>
