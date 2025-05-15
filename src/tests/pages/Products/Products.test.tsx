import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Products } from './../../../pages'
import productList from '../../../../src/products.json'

function getRowByProductName(name: string) {
  const rows = screen.getAllByRole('row')
  return rows.find((row) => within(row).queryByText(name))
}

describe('Products', () => {
  it('renders table with correct headers', () => {
    render(<Products />)

    expect(screen.getByText('Nazwa')).toBeInTheDocument()
    expect(screen.getByText('Cena')).toBeInTheDocument()
    expect(screen.getByText('Ilość')).toBeInTheDocument()
  })

  it('renders correct number of rows', () => {
    render(<Products />)

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(productList.length + 1)
  })

  it('renders specific product row correctly', () => {
    render(<Products />)

    const product = productList.find((p) => p.name === 'Silnik V6')
    expect(product).toBeDefined()

    const row = getRowByProductName('Silnik V6')
    expect(row).toBeTruthy()
    expect(
      within(row!).getByText(product!.price.toString()),
    ).toBeInTheDocument()
    expect(
      within(row!).getByText(product!.quantity.toString()),
    ).toBeInTheDocument()
  })
})
