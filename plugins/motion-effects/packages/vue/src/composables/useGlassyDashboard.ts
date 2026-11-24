/**
 * GlassyDashboard 的数据与格式化层：常量、样例数据、数学工具逐字取自 React 原件，
 * 只把节点型图标换成名称字符串（组件里映射到 @lucide/vue 组件），并去掉框架胶水。
 * 本模块不在顶层访问 window / document，SSR 安全（vue-porting §11）。
 */

export type Period = '7 days' | '30 days' | '90 days'
export type View = 'command' | 'trends' | 'metrics' | 'operations'
export type ChartTone = 'coral' | 'ink' | 'teal' | 'ochre'
export type CountFormat = 'number' | 'usd' | 'compact' | 'percent'
export type WorkStatus = 'Needs review' | 'Scheduled' | 'Running' | 'Exceptions'

export interface BackgroundCredit {
  label: string
  href: string
}

export interface WorkItem {
  id: string
  name: string
  description: string
  tool: string
  owner: string
  status: WorkStatus
  timestamp: string
}

export interface Analytics {
  revenue: number
  orders: number
  visitors: number
  refunds: number
  automation: number
  subscribers: number
  revenueChange: string
  orderChange: string
  visitorChange: string
  refundChange: string
  axis: string[]
  collected: number[]
  costs: number[]
  desktop: number[]
  devices: number[]
}

export interface WorkspaceView {
  id: View
  label: string
  short: string
  icon: string
  description: string
  prompt: string
}

export const studioPhoto = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80&fit=crop";

export const periods = ["7 days", "30 days", "90 days"] satisfies Period[];

export const analytics = {
  "7 days": {
    revenue: 11600, orders: 319, visitors: 2184, refunds: 14, automation: 304, subscribers: 1847,
    revenueChange: "+4.7%", orderChange: "+7.4%", visitorChange: "+5.2%", refundChange: "−8.0%",
    axis: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
    collected: [1.2, 1.5, 1.35, 1.9, 1.59, 1.72, 2.34],
    costs: [.8, .92, .72, .85, 1.04, 1.01, .84],
    desktop: [58, 63, 61, 57, 59, 64, 60],
    devices: [54, 38, 8],
  },
  "30 days": {
    revenue: 47200, orders: 1328, visitors: 8344, refunds: 56, automation: 1284, subscribers: 1847,
    revenueChange: "+8.3%", orderChange: "+12.2%", visitorChange: "+9.0%", refundChange: "−3.4%",
    axis: ["Oct 19", "Oct 24", "Oct 29", "Nov 3", "Nov 8", "Nov 13", "Nov 17"],
    collected: [5.5, 6.4, 5.2, 7.6, 6.8, 7.1, 8.6],
    costs: [4.3, 4.85, 4.52, 4.2, 5.85, 5.15, 5.5],
    desktop: [66, 57, 64, 58, 60, 55, 61],
    devices: [56, 36, 8],
  },
  "90 days": {
    revenue: 126100, orders: 3728, visitors: 24132, refunds: 162, automation: 3562, subscribers: 1847,
    revenueChange: "+13.4%", orderChange: "+17.5%", visitorChange: "+11.6%", refundChange: "−5.2%",
    axis: ["Aug 20", "Sep 4", "Sep 19", "Oct 4", "Oct 19", "Nov 3", "Nov 17"],
    collected: [13.7, 16.2, 15.4, 16.8, 18.6, 20.4, 25],
    costs: [10.2, 11.2, 12.1, 11.16, 13.4, 13.1, 14.9],
    desktop: [64, 62, 59, 53, 56, 63, 57],
    devices: [58, 33, 9],
  },
};

export const automationActivity = [
  { label: "Tue", complete: 108, review: 10 },
  { label: "Wed", complete: 176, review: 11 },
  { label: "Thu", complete: 138, review: 14 },
  { label: "Fri", complete: 213, review: 19 },
  { label: "Sat", complete: 155, review: 12 },
  { label: "Sun", complete: 161, review: 15 },
  { label: "Mon", complete: 238, review: 14 },
];

export const workStatuses = ["Needs review", "Scheduled", "Running", "Exceptions"] satisfies WorkStatus[];

export const initialWork = [
  { id: "OP-241", name: "Refund approval", description: "A refund exception is ready for the owner to review.", tool: "Stripe", owner: "Finance", status: "Needs review", timestamp: "10:42" },
  { id: "OP-238", name: "Send cap review", description: "Review the first batch size for the renewal campaign.", tool: "HubSpot", owner: "Marketing", status: "Needs review", timestamp: "10:16" },
  { id: "OP-235", name: "Inventory check", description: "Review 23 low-stock items for the next supplier order.", tool: "Shopify", owner: "Operations", status: "Scheduled", timestamp: "15:00" },
  { id: "OP-234", name: "Executive summary", description: "Compile revenue, customer support and campaign performance.", tool: "Reports", owner: "Analytics", status: "Scheduled", timestamp: "Fri 09:00" },
  { id: "OP-232", name: "Sync 142 orders", description: "Update CRM and fulfillment records with validated orders.", tool: "Shopify", owner: "Operations", status: "Running", timestamp: "09:52" },
  { id: "OP-229", name: "Lead enrichment", description: "Match recent support requests to the sales pipeline.", tool: "HubSpot", owner: "Sales", status: "Running", timestamp: "09:23" },
  { id: "OP-227", name: "Duplicate account", description: "Two CRM entries share a billing address. Updates are on hold.", tool: "Salesforce", owner: "Operations", status: "Exceptions", timestamp: "09:06" },
  { id: "OP-223", name: "Calendar access", description: "The scheduling connector needs an owner to restore write access.", tool: "Google", owner: "Marketing", status: "Exceptions", timestamp: "08:41" },
] satisfies WorkItem[];

export const recentActivity = [
  { id: "ACT-108", event: "Order records validated", source: "Shopify", status: "Complete", time: "10:38" },
  { id: "ACT-107", event: "Refund sent to review", source: "Stripe", status: "Needs review", time: "10:24" },
  { id: "ACT-106", event: "Renewal sequence scheduled", source: "HubSpot", status: "Scheduled", time: "10:07" },
  { id: "ACT-105", event: "Support digest delivered", source: "Reports", status: "Complete", time: "09:51" },
  { id: "ACT-104", event: "Account match paused", source: "Salesforce", status: "Exceptions", time: "09:06" },
];

export const views = [
  { id: "command", label: "Command Center", short: "Command", icon: "layout-dashboard", description: "Revenue, automations, and what needs your attention.", prompt: "Show me what needs attention." },
  { id: "trends", label: "Trends", short: "Trends", icon: "trending-up", description: "Compare operating costs and revenue over time.", prompt: "How is revenue trending this month?" },
  { id: "metrics", label: "Metrics", short: "Metrics", icon: "bar-chart-3", description: "Track orders, traffic, and device performance.", prompt: "Show me traffic by device." },
  { id: "operations", label: "Premium Operations", short: "Operations", icon: "briefcase-business", description: "Manage approvals, schedules, and exceptions across systems.", prompt: "Which actions are waiting for review?" },
] satisfies WorkspaceView[];


export const deviceLabels = ['Desktop', 'Mobile', 'Tablet']
export const deviceTones: ChartTone[] = ['coral', 'ink', 'teal']

export const statusStyle: Record<WorkStatus, { icon: string; tone: ChartTone }> = {
  'Needs review': { icon: 'list-checks', tone: 'coral' },
  Scheduled: { icon: 'clock-3', tone: 'ochre' },
  Running: { icon: 'zap', tone: 'teal' },
  Exceptions: { icon: 'triangle-alert', tone: 'ink' }
}

export const number = new Intl.NumberFormat('en-US')
export const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format
export const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1
}).format

export const formatCount: Record<CountFormat, (value: number) => string> = {
  number: value => number.format(Math.round(value)),
  usd,
  compact: usdCompact,
  percent: value => `${value.toFixed(1)}%`
}

export type Point = [number, number]

/** 与 React 原件一致的 Steffen 风格贝塞尔路径构造（这里用中点平滑，常量未改）。 */
export function curve(points: Point[]): string {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`
    const [previousX, previousY] = points[index - 1]
    const midpoint = (x + previousX) / 2
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`
  }, '')
}

export const routeOrder: View[] = views.map(view => view.id)

/** SSR 安全：模块顶层不读 location，调用时才判断。 */
export function routeFromHash(): View {
  if (typeof location === 'undefined') return 'command'
  const id = location.hash.slice(1)
  return routeOrder.find(view => view === id) ?? 'command'
}

/** 浏览器本地 CSV 导出；只在用户事件里调用。 */
export function saveCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
