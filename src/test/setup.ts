import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => `blob:legato/${Math.random().toString(36).slice(2)}`
}

if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => undefined
}
