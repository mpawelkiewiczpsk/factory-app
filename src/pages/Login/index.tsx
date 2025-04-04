import React from 'react'
import type { FormProps } from 'antd'
import { login } from '../../api/auth.ts'
import type { LoginData } from '../../types.ts'
import { Button, Form, Input, Flex } from 'antd'

type FieldType = {
  username?: string
  password?: string
  remember?: string
}

const onFinish: FormProps<FieldType>['onFinish'] = (values: LoginData) => {
  login(values).then((data) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  })

  console.log('Success:', values)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo)
}

const App: React.FC = () => (
  <Flex justify="center" align="center" className="h-screen">
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
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
          Submit
        </Button>
      </Form.Item>
    </Form>
  </Flex>
)

export default App
