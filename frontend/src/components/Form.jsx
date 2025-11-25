import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAlert } from "../contexts/AlertContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

// Ícone SVG do Google
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
  </svg>
);

// Ícone SVG do Facebook
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 35.9789 8.77641 45.908 20.25 47.7084V30.9375H14.1562V24H20.25V18.7125C20.25 12.6975 23.8331 9.375 29.3152 9.375C31.9402 9.375 34.6875 9.84375 34.6875 9.84375V15.75H31.6613C28.68 15.75 27.75 17.6002 27.75 19.5V24H34.4062L33.3422 30.9375H27.75V47.7084C39.2236 45.908 48 35.9789 48 24Z" fill="white"/>
  </svg>
);

function Form({ route, method }) {
    const { showError } = useAlert();
  const navigate = useNavigate();

  const initialData =
    method === "login"
      ? { username: "", password: "" }
      : {
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        };

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (method === "login") {
        response = await api.post(route, data);
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate("/");
      } else {
        const { first_name, last_name, email, password } = data;
        response = await api.post(route, { first_name, last_name, email, password });
        navigate("/login");
      }
    } catch (error) {
      const msg = error?.response?.data || error.message || "Erro desconhecido";
      showError(`Erro ao processar requisição: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        {/* Logo e Cabeçalho */}
        <header className="form-header">
          <div className="logo-container">
            <div className="logo-circle">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L20 10L28 12L22 18L24 26L16 22L8 26L10 18L4 12L12 10L16 2Z" fill="white"/>
              </svg>
            </div>
            <h1 className="app-name">Give.me</h1>
          </div>
          <h2 className="welcome-title">
            {method === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h2>
          <p className="welcome-subtitle">
            {method === "login"
              ? "Entre para continuar compartilhando"
              : "Junte-se à nossa comunidade de compartilhamento"}
          </p>
        </header>

        {/* Formulário */}
        <form className="login-form" onSubmit={handleSubmit}>
          {method === "login" ? (
            <>
              <input
                type="text"
                name="username"
                placeholder="Email ou nome de usuário"
                value={data.username}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={data.password}
                onChange={handleChange}
                className="form-input"
                required
              />
              <a href="#" className="forgot-password">
                Esqueceu sua senha?
              </a>
            </>
          ) : (
            <>
              <input
                type="text"
                name="first_name"
                placeholder="Nome"
                value={data.first_name}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Sobrenome"
                value={data.last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={data.email}
                onChange={handleChange}
                className="form-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={data.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </>
          )}

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              method === "login" ? "Entrar" : "Criar Conta"
            )}
          </button>
        </form>

        {/* Login Social */}
        {method === "login" && (
          <>
            <div className="divider">
              <span>ou continue com</span>
            </div>
            <div className="social-buttons">
              <button className="btn-google" type="button">
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button className="btn-facebook" type="button">
                <FacebookIcon />
                <span>Facebook</span>
              </button>
            </div>
          </>
        )}

        {/* Rodapé */}
        <footer className="form-footer">
          {method === "login" ? (
            <p>
              Não tem uma conta?{" "}
              <a href="/register" className="signup-link">
                Criar conta
              </a>
            </p>
          ) : (
            <p>
              Já tem uma conta?{" "}
              <a href="/login" className="signup-link">
                Entrar
              </a>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default Form;
