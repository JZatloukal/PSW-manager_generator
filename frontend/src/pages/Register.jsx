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
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    if (
      password.length < minLength ||
      !hasNumber.test(password) ||
      !hasSpecialChar.test(password)
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
        "Heslo musí mít alespoň 8 znaků, obsahovat alespoň jedno číslo a jedno speciální písmeno.",
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

      if (response.ok) {
        showNotification("Účet byl úspěšně vytvořen. Můžete se přihlásit.", "success");
        // Vyčištění formuláře po úspěšné registraci
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
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
      "Username already exists": "Uživatelské jméno již existuje",
      "Email already exists": "Email již existuje",
      "Username is required": "Uživatelské jméno je povinné",
      "Email is required": "Email je povinný",
      "Password is required": "Heslo je povinné",
      "Invalid email format": "Neplatný formát emailu",
      "Username must be at least 3 characters": "Uživatelské jméno musí mít alespoň 3 znaky",
      "Password must be at least 8 characters": "Heslo musí mít alespoň 8 znaků",
      "Password must contain at least one number": "Heslo musí obsahovat alespoň jedno číslo",
      "Password must contain at least one special character": "Heslo musí obsahovat alespoň jeden speciální znak"
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