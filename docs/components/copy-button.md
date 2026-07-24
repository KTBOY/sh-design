# CopyButton 复制按钮

一键将文本复制到剪贴板的功能型按钮，内置复制成功反馈，适用于分享链接、复制口令、复制代码片段等业务场景。

## 基础用法

设置 `text` 属性即可指定要复制的内容。点击后按钮会短暂进入“已复制”状态。

<div class="sh-demo">
  <ShCopyButton text="Hello sh-design" />
</div>

```vue
<template>
  <ShCopyButton text="Hello sh-design" />
</template>
```

## 按钮类型

通过 `type` 设置不同视觉风格：`default`、`primary`、`text`。

<div class="sh-demo">
  <ShCopyButton text="default" type="default" />
  <ShCopyButton text="primary" type="primary" />
  <ShCopyButton text="text" type="text" />
</div>

```vue
<template>
  <ShCopyButton text="default" type="default" />
  <ShCopyButton text="primary" type="primary" />
  <ShCopyButton text="text" type="text" />
</template>
```

## 按钮尺寸

通过 `size` 设置尺寸：`small`、`default`、`large`。

<div class="sh-demo">
  <ShCopyButton text="small" size="small" type="primary" />
  <ShCopyButton text="default" size="default" type="primary" />
  <ShCopyButton text="large" size="large" type="primary" />
</div>

```vue
<template>
  <ShCopyButton text="small" size="small" type="primary" />
  <ShCopyButton text="default" size="default" type="primary" />
  <ShCopyButton text="large" size="large" type="primary" />
</template>
```

## 自定义文案

通过 `label` 与 `success-label` 自定义按钮文案。

<div class="sh-demo">
  <ShCopyButton text="1435787623" label="复制 QQ" success-label="复制成功 🎉" type="primary" />
</div>

```vue
<template>
  <ShCopyButton
    text="1435787623"
    label="复制 QQ"
    success-label="复制成功 🎉"
    type="primary"
  />
</template>
```

## 禁用状态

<div class="sh-demo">
  <ShCopyButton text="disabled" disabled />
</div>

```vue
<template>
  <ShCopyButton text="disabled" disabled />
</template>
```

## API

### Props

| 属性              | 说明                     | 类型                                 | 默认值    |
| ----------------- | ------------------------ | ------------------------------------ | --------- |
| `text`            | 要复制的文本             | `string`                             | `''`      |
| `type`            | 按钮类型                 | `'default' \| 'primary' \| 'text'`   | `'default'` |
| `size`            | 按钮尺寸                 | `'small' \| 'default' \| 'large'`    | `'default'` |
| `label`           | 默认状态下的文案         | `string`                             | `'复制'`  |
| `success-label`   | 复制成功后的文案         | `string`                             | `'已复制'` |
| `success-duration`| 成功状态持续时间（毫秒） | `number`                             | `2000`    |
| `disabled`        | 是否禁用                 | `boolean`                            | `false`   |

### Events

| 事件名    | 说明             | 回调参数                  |
| --------- | ---------------- | ------------------------- |
| `success` | 复制成功时触发   | `(payload: { text: string })` |
| `error`   | 复制失败时触发   | `(payload: { error: Error })` |

### Slots

| 插槽名    | 说明               | 作用域参数           |
| --------- | ------------------ | -------------------- |
| `default` | 自定义按钮内容     | `{ copied: boolean }` |
