/** PaperCrumple 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'PaperCrumple',
  deps: ['three'],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    src: "正面图片",
    backSrc: "背面图片",
    width: "纸张宽度",
    height: "纸张高度",
    sceneHeight: "场景高度",
    imageFit: "图片填充方式",
    releaseBehavior: "松手行为",
    crumpleAmount: "揉皱程度",
    crumpleDuration: "揉皱时长",
    releaseDuration: "展开时长",
    foldCount: "折痕数量",
    foldSharpness: "折痕锐度",
    wrinkleDepth: "褶皱深度",
    creaseStrength: "压痕强度",
    paperColor: "纸张颜色",
    roughness: "纸张粗糙度",
    paperTexture: "纸纹强度",
    lightIntensity: "光照强度",
    lightAngle: "光照角度",
    shadow: "启用阴影",
    shadowOpacity: "阴影透明度",
    draggable: "可拖拽",
    dragRotation: "拖拽旋转",
    dragRadius: "拖拽半径",
    returnToOrigin: "松手归位",
    rotation: "初始旋转",
    seed: "随机种子",
    detail: "网格精度",
    disabled: "禁用",
    className: "根类名"
  },
  props: [
    p('src', 'string', undefined, '纸张正面图片（同源或允许 CORS）', 'text'),
    p('backSrc', 'string', '', '背面图片；留空用纸色', 'text'),
    p('width', 'number', 320, '纸张宽度', 'number', { min: 160, max: 600, step: 20, unit: 'px' }),
    p('height', 'number', 400, '纸张高度', 'number', { min: 200, max: 700, step: 20, unit: 'px' }),
    p('sceneHeight', 'number', 560, '舞台高度', 'number', { min: 300, max: 900, step: 20, unit: 'px' }),
    p('imageFit', '"cover" | "contain"', 'cover', '图片填充方式', 'select', { options: [{ value: 'cover', label: '裁剪填满' }, { value: 'contain', label: '完整显示' }] }),
    p('releaseBehavior', '"restore" | "creased" | "stay"', 'restore', '松手后恢复、保留折痕或保持揉皱', 'select', {
      options: [
          { value: 'restore', label: '恢复原状' },
          { value: 'creased', label: '留下折痕' },
          { value: 'stay', label: '保持揉皱' }
        ]
    }),
    p('crumpleAmount', 'number', 0.85, '揉皱程度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('crumpleDuration', 'number', 0.55, '揉皱动画时长', 'slider', { min: 0.1, max: 2, step: 0.05, unit: 's' }),
    p('releaseDuration', 'number', 0.4, '恢复动画时长', 'slider', { min: 0.1, max: 2, step: 0.05, unit: 's' }),
    p('foldCount', 'number', 6, '折痕数量', 'slider', { min: 3, max: 16, step: 1 }),
    p('foldSharpness', 'number', 0.6, '折痕锐度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('wrinkleDepth', 'number', 0.65, '褶皱深度', 'slider', { min: 0, max: 2, step: 0.05 }),
    p('creaseStrength', 'number', 0.18, '松手后残留折痕强度', 'slider', { min: 0, max: 1, step: 0.02 }),
    p('paperColor', 'string', '#f4f0e8', '背面纸色', 'color'),
    p('roughness', 'number', 0.92, '材质粗糙度', 'slider', { min: 0, max: 1, step: 0.02 }),
    p('paperTexture', 'number', 0.08, '纸张颗粒强度', 'slider', { min: 0, max: 1, step: 0.02 }),
    p('lightIntensity', 'number', 1.8, '光照强度', 'slider', { min: 0, max: 4, step: 0.1 }),
    p('lightAngle', 'number', -35, '光照角度', 'slider', { min: -90, max: 90, step: 5, unit: '°' }),
    p('shadow', 'boolean', true, '投影', 'switch'),
    p('shadowOpacity', 'number', 0.08, '投影不透明度', 'slider', { min: 0, max: 0.5, step: 0.01 }),
    p('draggable', 'boolean', true, '按住可拖动纸张', 'switch'),
    p('dragRotation', 'number', 10, '拖动时的最大倾角', 'slider', { min: 0, max: 60, step: 1, unit: '°' }),
    p('dragRadius', 'number', 180, '拖动范围', 'slider', { min: 0, max: 400, step: 20, unit: 'px' }),
    p('returnToOrigin', 'boolean', true, '松手回到原位', 'switch'),
    p('rotation', 'number', 0, '初始旋转角', 'slider', { min: -180, max: 180, step: 5, unit: '°' }),
    p('seed', 'number', 7, '折痕随机种子', 'number', { min: 0, max: 999, step: 1 }),
    p('detail', 'number', 64, '几何细分；越小越省 GPU', 'slider', { min: 16, max: 128, step: 8 }),
    p('disabled', 'boolean', false, '禁用交互', 'switch'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'state-change', args: '[state: string]', desc: 'flat / holding / crumpled / creased' },
    { name: 'error', args: '[error: Error]', desc: '图片加载或 WebGL 出错' }
  ]
}
