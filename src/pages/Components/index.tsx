import React, { JSX, useEffect, useState } from 'react'
import { Table, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { getComponents } from '../../api/components'

const Components = (): JSX.Element => {
  const [data, setData] = useState([])

  const fetchComponents = async () => {
    try {
      const res = await getComponents()
      Array.isArray(res) ? setData(res) : setData([])
    } catch (error) {
      console.error('Błąd przy pobieraniu komponentów:', error)
    }
  }

  useEffect(() => {
    fetchComponents()
  }, [])

  const handleRefresh = () => {
    fetchComponents()
  }

  const columns = [
    {
      title: 'Nazwa',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ilość',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1>Komponenty</h1>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Odśwież
        </Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}

export default Components
