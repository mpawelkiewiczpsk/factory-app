import React from 'react'
import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Przepraszamy, ale strona, której szukasz, nie została znaleziona."
      extra={
        <Button type="primary">
          <Link to="/">Powrót do strony głównej</Link>
        </Button>
      }
    />
  )
}

export default NotFound
