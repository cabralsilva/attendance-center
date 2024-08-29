import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Card, Col, Form, Input, Row, notification } from "antd"
import { Rule } from "antd/es/form"
import { useForm } from "antd/es/form/Form"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LogoSingle from "../../assets/svg/logo-single.svg?react"
import LoginFlow from "../../flow/login/LoginFlow"
import { ICredentials } from "../../models/ICredentials"
import "./styles.css"
import CheckTokenFlow from "../../flow/login/CheckTokenFlow"
export const LoginPage = () => {

  const [processing, setProcessing] = useState<boolean>(false)
  const navigate = useNavigate();
  const [form] = useForm();

  const login = async (values: any) => {
    let credentials: ICredentials = values
    setProcessing(true)
    try {
      await LoginFlow.exec(credentials)
      navigate("/home")
    } catch (error: any) {
      console.error(error)
      notification.warning({
        message: "Login inválido",
        description: error.message,
        duration: 5,
        placement: "topRight",
      })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (CheckTokenFlow.isValid()) {
      navigate("/home")
    }
  })
  return (
    <div className="login-main-div">
      <Card className="login-form-div">
        <Row justify="center">
          <Col>
            <LogoSingle />
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <p>Acesso restrito</p>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={login} autoComplete="off">
          <Row>
            <Col span="24">
              <Form.Item label="E-mail" name="username" rules={[
                { required: true, message: 'Informe seu email!' },
                {
                  validator: (_rule: Rule, value: string) => {
                    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if (emailRegex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Email inválido');
                  }
                }]}
                initialValue="d.nadson@yahoo.com.br"
                >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span="24">
              <Form.Item label="Senha" name="password" rules={[
                { required: true, message: 'Informe sua senha!' }
              ]}
              initialValue="123456">
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span="24">
              <Button loading={processing} type="primary" htmlType="submit">Entrar</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}