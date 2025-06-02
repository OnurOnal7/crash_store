import LoginForm from "../components/LoginForm";
import "./LoginPage.css"; 
import SimsoftLogo from "../assets/simsoft.jpg";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <img src={SimsoftLogo} alt="SimsoftLogo" className="login-logo" />
        <LoginForm />
      </div>
    </div>
  );
}