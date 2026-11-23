import { EFFECTS } from '../.vitepress/data/effects.mjs'

export default {
  paths() {
    return EFFECTS.map(effect => ({
      params: { id: effect.id }
    }))
  }
}