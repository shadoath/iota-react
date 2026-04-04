import { describe, it, expect } from 'vitest'
import {
  areAllPlacementsInSameLine,
  isPlacementInSameLineAsPending,
} from '../turnValidation'
import { Card, PendingPlacement } from '../../types/game'

function card(
  number: Card['number'],
  color: Card['color'],
  shape: Card['shape'],
  id = `test-${number}-${color}-${shape}`
): Card {
  return { id, number, color, shape }
}

function pending(c: Card, row: number, col: number): PendingPlacement {
  return { card: c, position: { row, col } }
}

describe('areAllPlacementsInSameLine', () => {
  it('returns true for empty array', () => {
    expect(areAllPlacementsInSameLine([])).toBe(true)
  })

  it('returns true for single placement', () => {
    expect(
      areAllPlacementsInSameLine([
        pending(card(1, 'red', 'triangle'), 0, 0),
      ])
    ).toBe(true)
  })

  it('returns true for placements in same row', () => {
    expect(
      areAllPlacementsInSameLine([
        pending(card(1, 'red', 'triangle'), 0, 0),
        pending(card(2, 'green', 'square'), 0, 3),
        pending(card(3, 'blue', 'circle'), 0, 7),
      ])
    ).toBe(true)
  })

  it('returns true for placements in same column', () => {
    expect(
      areAllPlacementsInSameLine([
        pending(card(1, 'red', 'triangle'), 0, 5),
        pending(card(2, 'green', 'square'), 2, 5),
        pending(card(3, 'blue', 'circle'), 4, 5),
      ])
    ).toBe(true)
  })

  it('returns false for diagonal placements', () => {
    expect(
      areAllPlacementsInSameLine([
        pending(card(1, 'red', 'triangle'), 0, 0),
        pending(card(2, 'green', 'square'), 1, 1),
      ])
    ).toBe(false)
  })

  it('returns false for scattered placements', () => {
    expect(
      areAllPlacementsInSameLine([
        pending(card(1, 'red', 'triangle'), 0, 0),
        pending(card(2, 'green', 'square'), 0, 1),
        pending(card(3, 'blue', 'circle'), 1, 2),
      ])
    ).toBe(false)
  })
})

describe('isPlacementInSameLineAsPending', () => {
  it('returns true when no pending placements', () => {
    expect(isPlacementInSameLineAsPending({ row: 5, col: 5 }, [])).toBe(true)
  })

  it('returns true when new position is in same row as single pending', () => {
    const pendings = [pending(card(1, 'red', 'triangle'), 3, 0)]
    expect(isPlacementInSameLineAsPending({ row: 3, col: 5 }, pendings)).toBe(true)
  })

  it('returns true when new position is in same column as single pending', () => {
    const pendings = [pending(card(1, 'red', 'triangle'), 0, 3)]
    expect(isPlacementInSameLineAsPending({ row: 5, col: 3 }, pendings)).toBe(true)
  })

  it('returns false when not in same row or column as single pending', () => {
    const pendings = [pending(card(1, 'red', 'triangle'), 0, 0)]
    expect(isPlacementInSameLineAsPending({ row: 1, col: 1 }, pendings)).toBe(false)
  })

  it('returns true when aligning with established row of multiple pendings', () => {
    const pendings = [
      pending(card(1, 'red', 'triangle'), 2, 0),
      pending(card(2, 'green', 'square'), 2, 1),
    ]
    expect(isPlacementInSameLineAsPending({ row: 2, col: 5 }, pendings)).toBe(true)
  })

  it('returns false when not aligning with established row', () => {
    const pendings = [
      pending(card(1, 'red', 'triangle'), 2, 0),
      pending(card(2, 'green', 'square'), 2, 1),
    ]
    expect(isPlacementInSameLineAsPending({ row: 3, col: 0 }, pendings)).toBe(false)
  })

  it('returns true when aligning with established column of multiple pendings', () => {
    const pendings = [
      pending(card(1, 'red', 'triangle'), 0, 4),
      pending(card(2, 'green', 'square'), 1, 4),
    ]
    expect(isPlacementInSameLineAsPending({ row: 5, col: 4 }, pendings)).toBe(true)
  })
})
