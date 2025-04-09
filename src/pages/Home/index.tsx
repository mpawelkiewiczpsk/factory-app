import React from 'react'
import { Card, Row, Col } from 'antd'

const Home: React.FC = () => {
  const stats = {
    components: 12,
    products: 34,
    suppliers: 7,
    orders: 15,
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Strona główna</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card title="Komponenty">
            <p style={{ fontSize: 24, margin: 0 }}>{stats.components}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Produkty">
            <p style={{ fontSize: 24, margin: 0 }}>{stats.products}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Dostawcy">
            <p style={{ fontSize: 24, margin: 0 }}>{stats.suppliers}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Zamówienia">
            <p style={{ fontSize: 24, margin: 0 }}>{stats.orders}</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
