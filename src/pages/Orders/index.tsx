import { JSX } from 'react'
import { Flex } from 'antd'
import AddNewOrder from './components/AddNewOrder.tsx'
const Orders: () => JSX.Element = () => {
  return (
    <Flex justify="space-between">
      <h1>Zamówienia</h1>
      <AddNewOrder />
    </Flex>
  )
}

export default Orders
