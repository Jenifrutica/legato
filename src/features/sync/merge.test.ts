import { describe, expect, it } from 'vitest'
import { mergeTable, mergeTombstones } from './merge'
import type { SyncRecord } from './types'

function record(id: string, updatedAt: number): SyncRecord {
  return { id, updatedAt, payload: { id } }
}

describe('mergeTable', () => {
  it('sube solo lo local y aplica solo lo remoto', () => {
    const plan = mergeTable([record('a', 10)], [record('b', 20)], [])

    expect(plan.toUpload.map((item) => item.id)).toEqual(['a'])
    expect(plan.toApplyLocal.map((item) => item.id)).toEqual(['b'])
  })

  it('gana la edición más reciente', () => {
    expect(
      mergeTable([record('a', 30)], [record('a', 10)], []).toUpload.map((item) => item.id),
    ).toEqual(['a'])
    expect(
      mergeTable([record('a', 10)], [record('a', 30)], []).toApplyLocal.map((item) => item.id),
    ).toEqual(['a'])
  })

  it('las lápidas borran en ambos lados y no resucitan', () => {
    const plan = mergeTable([record('a', 10)], [record('a', 10)], [{ id: 'a', deletedAt: 20 }])

    expect(plan.toDeleteLocal).toEqual(['a'])
    expect(plan.toDeleteRemote).toEqual(['a'])
    expect(plan.toUpload).toHaveLength(0)
    expect(plan.toApplyLocal).toHaveLength(0)
  })

  it('una edición posterior al borrado revive el registro', () => {
    const plan = mergeTable([record('a', 30)], [], [{ id: 'a', deletedAt: 20 }])

    expect(plan.toUpload.map((item) => item.id)).toEqual(['a'])
    expect(plan.toDeleteLocal).toHaveLength(0)
  })
})

describe('mergeTombstones', () => {
  it('une por id quedándose con el borrado más reciente', () => {
    expect(mergeTombstones([{ id: 'a', deletedAt: 10 }], [{ id: 'a', deletedAt: 30 }])).toEqual([
      { id: 'a', deletedAt: 30 },
    ])
  })
})
