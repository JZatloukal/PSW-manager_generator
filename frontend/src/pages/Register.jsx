import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { API_URL } from "../config";
import styles from "./Register.module.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showNotification } = useNotification();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[^A-Za-z0-9]/;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;

    if (
      password.length < minLength ||
      !hasNumber.test(password) ||
      !hasSpecialChar.test(password) ||
      !hasUppercase.test(password) ||
      !hasLowercase.test(password)
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showNotification("Hesla se neshodují.", "error");
      return;
    }

    if (!validatePassword(password)) {
      showNotification(
        "Heslo musí mít alespoň 8 znaků, obsahovat malé i velké písmeno, číslo a speciální znak.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message = translateErrorMessage(data?.error) || data?.message || "Registrace se nepodařila.";
        showNotification(message, "error");
        return;
      }

      showNotification("Účet byl úspěšně vytvořen. Můžete se přihlásit.", "success");
      // Vyčištění formuláře po úspěšné registraci
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      showNotification("Chyba serveru. Zkuste to prosím znovu.", "error");
    }
  };

  const translateErrorMessage = (error) => {
    const translations = {
      "Username already exists": "Uživatelské jméno již existuje",
      "Email already exists": "Email již existuje",
      "Username is required": "Uživatelské jméno je povinné",
      "Email is required": "Email je povinný",
      "Password is required": "Heslo je povinné",
      "Invalid email format": "Neplatný formát emailu",
      "Username must be at least 3 characters": "Uživatelské jméno musí mít alespoň 3 znaky",
      "Password must be at least 8 characters": "Heslo musí mít alespoň 8 znaků",
      "Password must contain at least one number": "Heslo musí obsahovat alespoň jedno číslo",
      "Password must contain at least one special character": "Heslo musí obsahovat alespoň jeden speciální znak",
      "Password must contain at least one uppercase letter": "Heslo musí obsahovat alespoň jedno velké písmeno",
      "Password must contain at least one lowercase letter": "Heslo musí obsahovat alespoň jedno malé písmeno",
      "Složitost hesla": "Heslo nesplňuje požadovaná kritéria"
    };
    return translations[error] || error || "Nastala chyba při registraci";
  };

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-card"]}>
        <h2 className={styles["register-title"]}>Registrace</h2>
        <form className={styles["register-form"]} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Uživatelské jméno"
            className={styles["register-input"]}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="E-mail"
            className={styles["register-input"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Heslo"
            className={styles["register-input"]}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Potvrdit heslo"
            className={styles["register-input"]}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className={styles["register-button"]}>
            Registrovat se
          </button>
        </form>
        <p className={styles["register-footer"]}>
          Už máte účet? <Link to="/login">Přihlaste se</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
