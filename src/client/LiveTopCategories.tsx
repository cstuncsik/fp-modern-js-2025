/**
 * React Live Dashboard Component
 *
 * Demonstrates:
 * - Functional React with hooks
 * - Real-time WebSocket integration
 * - Simple error handling for UX
 * - Delta calculations with change indicators
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Entry = { category: string; sum: number };

export default function LiveTopCategories() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const prev = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    console.log('🔌 Connecting to WebSocket server...');
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      setConnected(true);
      console.log('✅ Connected to live data stream');
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('❌ Disconnected from server');
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'top-categories' && msg.items) {
          setRows(msg.items);
          setLastUpdate(new Date(msg.at).toLocaleTimeString());
          setPageIndex(msg.pageIndex);
          console.log(`📊 Received update for page ${msg.pageIndex + 1}`);
        } else if (msg.type === 'hello') {
          console.log('👋 Server greeting:', msg.msg);
        }
      } catch (err) {
        console.warn('Failed to parse message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      console.log('🔌 Closing WebSocket connection');
      ws.close();
    };
  }, []);

  // Compute change indicators vs previous snapshot
  const withDelta = useMemo(() => rows.map(r => ({
    ...r,
    prev: prev.current.get(r.category),
  })), [rows]);

  // Store current snapshot for next diff
  useEffect(() => {
    const next = new Map<string, number>();
    for (const r of rows) next.set(r.category, r.sum);
    prev.current = next;
  }, [rows]);

  return (
    <div>
      {/* Status indicator */}
      <div style={{
        marginBottom: '16px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: connected ? '#f0fff4' : '#fed7d7',
        border: `1px solid ${connected ? '#9ae6b4' : '#feb2b2'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          color: connected ? '#276749' : '#c53030',
          fontWeight: 500,
          fontSize: '14px'
        }}>
          {connected ? '🟢 Live Stream Active' : '🔴 Disconnected'}
        </span>
        {lastUpdate && (
          <span style={{
            fontSize: '12px',
            color: '#718096'
          }}>
            Page {pageIndex + 1} • Last update: {lastUpdate}
          </span>
        )}
      </div>

      {/* Data table */}
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f7fafc' }}>
            <th style={{
              textAlign: 'left',
              padding: '12px 16px',
              fontWeight: 600,
              color: '#2d3748',
              fontSize: '14px'
            }}>Rank</th>
            <th style={{
              textAlign: 'left',
              padding: '12px 16px',
              fontWeight: 600,
              color: '#2d3748',
              fontSize: '14px'
            }}>Category</th>
            <th style={{
              textAlign: 'right',
              padding: '12px 16px',
              fontWeight: 600,
              color: '#2d3748',
              fontSize: '14px'
            }}>Total Sales</th>
            <th style={{
              textAlign: 'right',
              padding: '12px 16px',
              fontWeight: 600,
              color: '#2d3748',
              fontSize: '14px'
            }}>Change</th>
          </tr>
        </thead>
        <tbody>
          {withDelta.length === 0 ? (
            <tr>
              <td colSpan={4} style={{
                padding: '32px',
                textAlign: 'center',
                color: '#a0aec0',
                fontStyle: 'italic',
                fontSize: '14px'
              }}>
                {connected ? 'Waiting for data stream...' : 'Connect to server to see live updates'}
              </td>
            </tr>
          ) : (
            withDelta.map((r, i) => {
              const delta = r.prev === undefined ? 0 : r.sum - r.prev;
              const isNew = r.prev === undefined;
              const isUp = delta > 0;
              const isDown = delta < 0;

              return (
                <tr key={r.category} style={{
                  borderBottom: i < withDelta.length - 1 ? '1px solid #e2e8f0' : 'none',
                  backgroundColor: isNew ? '#f0fff4' : 'white'
                }}>
                  <td style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#4a5568'
                  }}>
                    {i + 1}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#2d3748',
                    textTransform: 'capitalize'
                  }}>
                    {r.category}
                    {isNew && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        backgroundColor: '#9ae6b4',
                        color: '#276749',
                        fontSize: '10px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        NEW
                      </span>
                    )}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#2d3748'
                  }}>
                    ${r.sum.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: 500,
                    color: isUp ? '#38a169' : isDown ? '#e53e3e' : '#a0aec0',
                    opacity: isNew ? 0.6 : 1
                  }}>
                    {isUp ? `+$${delta.toLocaleString()}` :
                     isDown ? `-$${Math.abs(delta).toLocaleString()}` :
                     '—'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Footer info */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#718096',
        textAlign: 'center'
      }}>
        💡 Powered by functional streams: Iterator Helpers → WebSocket → React hooks
      </div>
    </div>
  );
}
