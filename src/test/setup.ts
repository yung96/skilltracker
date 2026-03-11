import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Очистка после каждого теста (чтобы не влияли друг на друга)
afterEach(() => {
  cleanup()
})