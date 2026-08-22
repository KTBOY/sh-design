<template>
  <div class="demo demo-cube">
    <div class="scene">
      <div class="cube">
        <div class="face face--front">F</div>
        <div class="face face--back">B</div>
        <div class="face face--left">L</div>
        <div class="face face--right">R</div>
        <div class="face face--top">U</div>
        <div class="face face--bottom">D</div>
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
  background: radial-gradient(circle at 50% 42%, #131c3a 0%, #090e1f 74%);
}

.scene {
  perspective: 480px;
}

.cube {
  position: relative;
  width: 92px;
  aspect-ratio: 1;
  transform-style: preserve-3d;
  animation: cube-spin 9s linear infinite;
}

.face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(125, 211, 252, 0.45);
  color: rgba(224, 242, 254, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(160deg, rgba(37, 99, 235, 0.34), rgba(34, 211, 238, 0.14));
  box-shadow: inset 0 0 22px rgba(56, 189, 248, 0.22);
}

/* 每个面绕轴转正后位移半边长（92 / 2 = 46px），拼出正方体 */
.face--front {
  transform: translateZ(46px);
}
.face--back {
  transform: rotateY(180deg) translateZ(46px);
}
.face--left {
  transform: rotateY(-90deg) translateZ(46px);
}
.face--right {
  transform: rotateY(90deg) translateZ(46px);
}
.face--top {
  transform: rotateX(90deg) translateZ(46px);
}
.face--bottom {
  transform: rotateX(-90deg) translateZ(46px);
}

@keyframes cube-spin {
  from {
    transform: rotateX(-16deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-16deg) rotateY(360deg);
  }
}
</style>
