import React from 'react'
import type { FormProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth.ts'
import type { LoginData } from '../../types.ts'
import { Button, Form, Input, message } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'

type FieldType = {
  username?: string
  password?: string
  remember?: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()

  const onFinish: FormProps<FieldType>['onFinish'] = (values: LoginData) => {
    login(values)
      .then((data) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        navigate('/')
      })
      .catch(() => {
        message.error('Nieprawidłowe dane logowania. Spróbuj ponownie.')
      })
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo,
  ) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ width: '100%', maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="default"
              icon={<GoogleOutlined />}
              onClick={() =>
                (window.location.href = 'http://localhost:3000/auth/google')
              }
            >
              Zaloguj przez Google
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          padding: '20px',
        }}
      >
        <div>Witamy w Factory APP</div>
      </div>
    </div>
  )
}

export default Login
