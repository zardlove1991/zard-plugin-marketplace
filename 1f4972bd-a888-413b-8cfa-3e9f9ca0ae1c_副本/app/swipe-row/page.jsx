'use client';

import { useState } from 'react';
import SwipeRow from '@/components/ui/SwipeRow';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

const INITIAL = [
  { id: 'notes', title: '设计评审笔记', meta: '今天 14:00 · 3 条待办' },
  { id: 'brand', title: '品牌规范 v2', meta: '昨天 · 已同步到 CI 中心' },
  { id: 'launch', title: '发布清单确认', meta: '周五 · 12 项待核' }
];

export default function SwipeRowDemo() {
  const [rows, setRows] = useState(INITIAL);

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 48,
        background: '#101014'
      }}
    >
      <div style={{ width: 'min(560px, 100%)' }}>
        {rows.map(row => (
          <SwipeRow
            key={row.id}
            actions={[
              { id: 'delete', label: '删除', icon: <HugeiconsIcon icon={Delete02Icon} size={20} /> },
              { id: 'archive', label: '归档', icon: <HugeiconsIcon icon={Archive02Icon} size={20} />, dismiss: true }
            ]}
            onAction={action => console.log(action.id)}
            onCommit={() => setRows(current => current.filter(r => r.id !== row.id))}
            actionColor="#e5484d"
            drawerColor="#3f3f46"
            rowColor="#27272a"
            textColor="#f5f5f5"
            height={64}
            radius={16}
            actionWidth={80}
            direction="left"
            snapBounce={0.2}
            resistance={0.55}
            collapseMs={200}
            commitAt={0.6}
            fullSwipe
            style={{ marginBottom: 8 }}
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>{row.title}</span>
              <span style={{ fontSize: 12, color: 'rgba(245, 245, 245, 0.55)' }}>{row.meta}</span>
            </span>
          </SwipeRow>
        ))}
        {rows.length === 0 && (
          <p
            style={{
              margin: '16px 4px',
              fontSize: 13.5,
              lineHeight: 1.7,
              color: 'rgba(245, 245, 245, 0.5)'
            }}
          >
            全部处理完了。刷新页面可重置列表。
          </p>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(245, 245, 245, 0.5)' }}>
        向左拖动露出抽屉 · 满滑删除 · 方向键开合
      </p>
    </div>
  );
}
