import type { Component } from 'vue'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Command,
  Download,
  Ellipsis,
  Eye,
  Filter,
  LayoutDashboard,
  ListChecks,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  TriangleAlert,
  TrendingUp,
  Users,
  X,
  Zap,
  ArrowDownToLine
} from '@lucide/vue'

/** 数据层只存图标名；渲染时统一映射到 @lucide/vue 组件。 */
const icons: Record<string, Component> = {
  'arrow-down-right': ArrowDownRight,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'arrow-down-to-line': ArrowDownToLine,
  'bar-chart-3': BarChart3,
  bell: Bell,
  box: Box,
  'briefcase-business': BriefcaseBusiness,
  'chevron-right': ChevronRight,
  'circle-dollar-sign': CircleDollarSign,
  'clock-3': Clock3,
  command: Command,
  download: Download,
  ellipsis: Ellipsis,
  eye: Eye,
  filter: Filter,
  'layout-dashboard': LayoutDashboard,
  'list-checks': ListChecks,
  moon: Moon,
  search: Search,
  'shield-check': ShieldCheck,
  'shopping-bag': ShoppingBag,
  sun: Sun,
  'triangle-alert': TriangleAlert,
  'trending-up': TrendingUp,
  users: Users,
  x: X,
  zap: Zap
}

export function iconFor(name: string): Component | undefined {
  return icons[name]
}
