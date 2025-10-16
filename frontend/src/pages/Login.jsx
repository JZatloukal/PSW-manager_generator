import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { API_URL } from "../config";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Načtení uživatelských dat
        const userResponse = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const userData = await userResponse.json();
        
        // Přihlášení přes AuthContext
        login(data.access_token, userData);
        showNotification("Přihlášení proběhlo úspěšně.", "success");
      } else {
        // Překlad backend hlášek do češtiny
        const errorMessage = translateErrorMessage(data.error);
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      showNotification("Chyba serveru. Zkuste to prosím znovu.", "error");
    }
  };

  const translateErrorMessage = (error) => {
    const translations = {
      "Invalid credentials": "Neplatné přihlašovací údaje",
      "User not found": "Uživatel nebyl nalezen",
        "Invalid email or password": "Neplatný email nebo heslo",
      "Account is disabled": "Účet je deaktivován",
      "Too many login attempts": "Příliš mnoho pokusů o přihlášení",
        "Email is required": "Email je povinný",
      "Password is required": "Heslo je povinné"
    };
    return translations[error] || error || "Neplatné přihlašovací údaje";
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        <h2 className={styles["login-title"]}>Přihlášení</h2>
        <form className={styles["login-form"]} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="E-mail"
                className={styles["login-input"]}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
          <input
            type="password"
            placeholder="Heslo"
            className={styles["login-input"]}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className={styles["login-button"]}>
            Přihlásit se
          </button>
        </form>
        <p className={styles["login-footer"]}>
          Nemáte účet? <Link to="/register">Registrujte se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
