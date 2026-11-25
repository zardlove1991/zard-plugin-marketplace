/**
 * 侧栏分类图标、总览页分类 chips、侧栏过滤框共享的状态。
 * 模块级单例：三处读写同一组 ref，不需要层层透传。
 */
import { ref } from 'vue'

export const ALL = '全部'

const category = ref(ALL)
const query = ref('')

export function useNavFilter() {
  return { category, query, ALL }
}
