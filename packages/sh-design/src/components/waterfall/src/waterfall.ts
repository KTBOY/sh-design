import type { ExtractPropTypes, PropType } from 'vue'

export type WaterfallLayout = 'waterfall' | 'grid'

export type WaterfallScroller = 'self' | 'window'

/** 数据项：对象（字段名可通过 srcKey / widthKey 等配置）或图片 URL 字符串 */
export type WaterfallItemData = Record<string, any> | string

/** 单个卡片的布局矩形（虚拟列表渲染用，坐标相对内容区左上角） */
export interface WaterfallItemRect {
  /** 在 items 中的下标 */
  index: number
  x: number
  y: number
  width: number
  height: number
}

export interface WaterfallItemClickPayload {
  item: WaterfallItemData
  index: number
}

export interface WaterfallScrollPayload {
  scrollTop: number
}

/** 卡片入场动画的调优项（传给 `animate`，缺省项取默认值） */
export interface WaterfallAnimateOptions {
  /** 入场位移距离（px），越大动感越强。默认 `80` */
  distance?: number
  /** 动画时长（ms）。默认 `460` */
  duration?: number
  /** 同一批进入视口的卡片之间的错峰延迟（ms），`0` 为同时入场。默认 `60` */
  stagger?: number
  /** 每张卡片只在首次进入视口时播放（来回滚动不重放）。默认 `false` */
  once?: boolean
}

/** 入场动画的缺省参数 */
export const waterfallAnimateDefaults: Required<WaterfallAnimateOptions> = {
  distance: 80,
  duration: 460,
  stagger: 60,
  once: false
}

export const waterfallProps = {
  /** 数据列表。分页加载时在 `load-more` 中往数组追加即可（追加会增量布局，不重排已有卡片） */
  items: {
    type: Array as PropType<WaterfallItemData[]>,
    default: () => []
  },
  /** 布局模式：`waterfall` 瀑布流（最矮列优先）/ `grid` 等高网格 */
  layout: {
    type: String as PropType<WaterfallLayout>,
    default: 'waterfall'
  },
  /** 列数 */
  cols: {
    type: Number,
    default: 2
  },
  /** 卡片间距（px，行列同值） */
  gap: {
    type: Number,
    default: 12
  },
  /** 图片地址字段名（默认插槽渲染 ShLazyImage 时使用；数据项为字符串时忽略） */
  srcKey: {
    type: String,
    default: 'src'
  },
  /** 唯一 key 字段名（保证虚拟列表节点复用），数据项缺少该字段时回退为下标 */
  itemKey: {
    type: String,
    default: 'id'
  },
  /** 原始宽度字段名：与 heightKey 同时存在时按真实宽高比预留高度，加载前后零抖动 */
  widthKey: {
    type: String,
    default: 'width'
  },
  /** 原始高度字段名 */
  heightKey: {
    type: String,
    default: 'height'
  },
  /**
   * 无真实宽高时的兜底比例池（height / width），按下标取模选取。
   * 高度在布局时即固定、图片以 cover 填充，保证滚动回看也不抖动。
   */
  ratios: {
    type: Array as PropType<number[]>,
    default: () => [0.75, 0.9, 1, 1.2, 1.35]
  },
  /** grid 布局的单元格比例（height / width），1 为正方形 */
  gridRatio: {
    type: Number,
    default: 1
  },
  /** 每个卡片的额外固定高度（px），如图片下方的标题/操作区 */
  extraHeight: {
    type: Number,
    default: 0
  },
  /**
   * 滚动容器：
   * - `self`   → 组件自身滚动（需由父容器给定高度）
   * - `window` → 组件自然撑开，跟随页面 / 任意祖先容器滚动
   * 触底加载基于 IntersectionObserver 哨兵，两种模式下均可靠。
   */
  scroller: {
    type: String as PropType<WaterfallScroller>,
    default: 'self'
  },
  /**
   * 卡片入场动画：`true` 开启（默认）/ `false` 关闭 / 传对象微调参数
   * （`{ distance, duration, stagger, once }`，只写需要的字段，其余取默认）。
   *
   * 动画在卡片**真正进入视口**时才播放（而非节点创建时），并按滚动方向决定入场方向：
   * 下滚从下方滑入、上滚从上方滑入；卡片移出渲染范围后再回看会重放（`once` 可改为只播一次）。
   */
  animate: {
    type: [Boolean, Object] as PropType<boolean | WaterfallAnimateOptions>,
    default: true
  },
  /** 视口上下方的额外渲染缓冲（px），越大滚动越不易露白，渲染节点越多 */
  buffer: {
    type: Number,
    default: 300
  },
  /** 哨兵提前量（px）：距底部多远就触发 `load-more`（IntersectionObserver rootMargin） */
  threshold: {
    type: Number,
    default: 200
  },
  /** 是否加载中（父组件控制；为 true 时不会重复触发 `load-more`） */
  loading: {
    type: Boolean,
    default: false
  },
  /** 是否已全部加载完（为 true 时不再触发 `load-more`，展示 finished 文案） */
  finished: {
    type: Boolean,
    default: false
  },
  /** 默认插槽渲染 ShLazyImage 时的圆角 */
  radius: {
    type: [String, Number],
    default: 8
  },
  /** 底部加载中文案 */
  loadingText: {
    type: String,
    default: '加载中…'
  },
  /** 底部加载完成文案 */
  finishedText: {
    type: String,
    default: '没有更多了'
  },
  /** 空数据文案 */
  emptyText: {
    type: String,
    default: '暂无数据'
  }
}

export const waterfallEmits = {
  /** 底部哨兵进入视口（或内容不足一屏）时触发，父组件在此加载下一页 */
  'load-more': () => true,
  /** 点击卡片时触发 */
  'item-click': (_payload: WaterfallItemClickPayload) => true,
  /** 容器滚动时触发（rAF 节流） */
  scroll: (_payload: WaterfallScrollPayload) => true
}

export type WaterfallProps = ExtractPropTypes<typeof waterfallProps>
export type WaterfallEmits = typeof waterfallEmits
