import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../features/auth/api";
import { Form, Input, Button, message } from "antd";
import "./RegisterForm.css";

export default function RegisterForm() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await registerUser(values.email, values.password);
      messageApi.success("Registration successful");
      setTimeout(() => {
        form.resetFields();
        navigate("/login", { replace: true });
      }, 1000);
    } catch {
      messageApi.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="register"
        onFinish={handleRegister}
        layout="vertical"
        validateTrigger="onSubmit"
        className="register-form"
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
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password placeholder="Enter your password" autoComplete="new-password" size="large" />
        </Form.Item>

        <Form.Item className="register-button-item">
          <Button type="primary" htmlType="submit" loading={loading} block >
            Register
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
