import React, { useState } from 'react'
import { Button, Modal, Form, InputNumber, Space, AutoComplete } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import type { AutoCompleteProps } from 'antd'
import productList from '../../../products.json'
import { orderProducts } from '../../../api/orders.ts'

const getResults = (str: string) => {
  const list = productList.map((item) => ({
    value: item.name,
    label: item.name,
  }))

  return list.filter((product) =>
    product.value.toLowerCase().includes(str.toLowerCase()),
  )
}

const AddNewOrder: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [options, setOptions] = useState<AutoCompleteProps['options']>(
    productList.map((item) => ({
      value: item.name,
      label: item.name,
    })),
  )

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const onFinish = (values: any) => {
    let sum = 0

    values.products.forEach((item) => {
      let pro = productList.find((product) => product.name === item.product)

      sum += pro.price * item.quantity
    })

    window.location.href = `http://localhost:3000/payment/create-payment?amount=${sum}.00&description=order`
  }

  const onSelect = () => {
    setOptions(
      productList.map((item) => ({
        value: item.name,
        label: item.name,
      })),
    )
  }

  const getPanelValue = (searchText: string) =>
    !searchText ? [] : getResults(searchText)

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Dodaj zamówienie
      </Button>
      <Modal
        style={{ minWidth: '800px' }}
        title="Dodaj nowe zamówienie"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        maskClosable={false}
        footer={<></>}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          name="dynamic_form_nest_item"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'product']}
                      style={{ minWidth: 500 }}
                    >
                      <AutoComplete
                        options={options}
                        onSelect={onSelect}
                        style={{ width: 600 }}
                        onSearch={(text) => setOptions(getPanelValue(text))}
                        placeholder="Wybierz produkt"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      style={{ minWidth: 100 }}
                    >
                      <InputNumber placeholder="ilość" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Dodaj produkt
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Zamów
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AddNewOrder
