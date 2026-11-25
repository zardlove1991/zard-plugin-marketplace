/**
 * props 清单的构造器：p(名字, 类型, 默认值, 说明, 控件?, 额外选项?)
 *
 * control: text | number | slider | switch | select | color，留空表示不进 Customize 面板
 * extra:   min / max / step / unit（slider、number），options（select），usage: false（不写进用法代码）
 */
export function p(name, type, value, desc, control, extra = {}) {
  return { name, type, value, desc, control: control ?? null, ...extra }
}
