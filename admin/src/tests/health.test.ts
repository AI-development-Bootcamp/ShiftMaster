import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Admin Health Check', () => {
  it('should have valid environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should have React available', () => {
    expect(typeof React).toBe('object');
    expect(React).toBeDefined();
  });

  it('should have testing utilities available', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('should have DOM environment available', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should have React testing library available', async () => {
    const { render } = await import('@testing-library/react');
    expect(typeof render).toBe('function');
  });

  it('should have Redux store available', async () => {
    const { store } = await import('../store');
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
  });
});
