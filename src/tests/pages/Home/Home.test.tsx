import React from 'react'
import { render, screen } from '@testing-library/react'
import { Home } from './../../../pages'
import { describe, it, expect } from 'vitest'

describe('Home', () => {
  it('renders header and all cards with correct titles and values', () => {
    render(<Home />)

    // const { debug } = render(<Home />)
    // debug()

    expect(screen.getByText('Strona główna')).toBeInTheDocument()
    expect(screen.getByText('Komponenty')).toBeInTheDocument()
    expect(screen.getByText('Produkty')).toBeInTheDocument()
    expect(screen.getByText('Dostawcy')).toBeInTheDocument()
    expect(screen.getByText('Zamówienia')).toBeInTheDocument()

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
