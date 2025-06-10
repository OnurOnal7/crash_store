import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../features/auth/api";
import { Form, Input, Button, message } from "antd";
import "./LoginForm.css";

export default function LoginForm() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { access, refresh } = (await loginUser(
        values.email,
        values.password
      )) as { access: string; refresh: string };

      localStorage.setItem("userEmail", values.email);
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      messageApi.success("Login successful");
      setTimeout(() => {
        form.resetFields();
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      console.error(err);
      messageApi.error("Incorrect login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        validateTrigger="onSubmit"
        className="login-form"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input placeholder="Enter your email" autoComplete="off" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password placeholder="Enter your password" autoComplete="new-password" size="large" />
        </Form.Item>

        <Form.Item className="login-button-item">
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
