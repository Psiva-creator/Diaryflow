/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import React from 'react'
import type { AppProviderProps } from './AppContext'

// Mocking localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: any) => { store[key] = value.toString() }),
    clear: vi.fn(() => { store = {} })
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockInitialData: AppProviderProps['initialData'] = {
  user: { name: 'Test User', role: 'admin', avatar: 'TU' },
  farmers: [
    { id: 'F001', name: 'Arjun Singh', village: 'Sundarpur', phone: '9876543210', cattle: 6, status: 'active', joinDate: '2023-01-15', balance: 500 },
    { id: 'F002', name: 'Deepak Kumar', village: 'Ramnagar', phone: '9812345678', cattle: 4, status: 'active', joinDate: '2023-03-22', balance: 1200 },
  ],
  customers: [],
  collections: [],
  payments: [],
  receipts: [],
  tanks: [],
  notifications: [],
  todayCollections: [],
  totalMilkToday: 0,
  revenueToday: 0,
  pendingPayments: 0,
  activeFarmers: 2,
  last7Days: [],
  fatDist: [],
  todayStr: '2026-06-05',
  unreadNotifs: 0,
}

describe('AppContext Hydration & Core Logic', () => {
  it('should hydrate context state from initialData props', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => <AppProvider initialData={mockInitialData}>{children}</AppProvider>
    })

    expect(result.current.user.name).toBe('Test User')
    expect(result.current.farmers.length).toBe(2)
    expect(result.current.farmers[0].name).toBe('Arjun Singh')
    expect(result.current.farmers[0].balance).toBe(500)
    expect(result.current.activeFarmers).toBe(2)
  })

  it('should toggle theme correctly', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: ({ children }) => <AppProvider initialData={mockInitialData}>{children}</AppProvider>
    })

    expect(result.current.theme).toBe('light')
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
  })
})
