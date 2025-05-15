import React from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import productList from '../../products.json'

interface DataType {
  id: number
  name: string
  price: number
  quantity: number
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Nazwa',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Cena',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Ilość',
    dataIndex: 'quantity',
    key: 'quantity',
  },
]

const Products: React.FC = () => {
  return (
    <Table<DataType>
      columns={columns}
      dataSource={productList}
      rowKey="id"
      pagination={false}
    />
  )
}

export default Products
