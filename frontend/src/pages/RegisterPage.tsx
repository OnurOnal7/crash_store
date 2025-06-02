import RegisterForm from "../components/RegisterForm";
import "./RegisterPage.css"; 
import SimsoftLogo from "../assets/simsoft.jpg"; 

export default function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-card">
        <img src={SimsoftLogo} alt="SimsoftLogo" className="simsoft-logo" />
        <RegisterForm />
      </div>
    </div>
  )
}