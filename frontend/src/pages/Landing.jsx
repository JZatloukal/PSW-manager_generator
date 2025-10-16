import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";
import { ShieldCheckIcon, LockClosedIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/solid";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className={styles["landing-container"]}>
      <div className={styles["landing-left"]}>
        <div className={styles["landing-title"]}>
          <h1>Vítejte v Password Manageru</h1>
        </div>
        <div className={styles["landing-subtitle"]}>
          <p>Chraňte svá hesla jednoduše a bezpečně</p>
        </div>
        <div className={styles["landing-cta"]}>
          <button className={styles["cta-button"]} onClick={handleGetStarted}>
            Začít používat zdarma
          </button>
        </div>
        <div className={styles["landing-features"]}>
          <div className={styles["feature-box"]}>
            <ShieldCheckIcon className={styles["feature-icon"]} />
            <div>
              <h3 className={styles["feature-title"]}>Bezpečné uložení</h3>
              <p className={styles["feature-desc"]}>Vaše hesla jsou chráněna nejmodernějším šifrováním.</p>
            </div>
          </div>
          <div className={styles["feature-box"]}>
            <LockClosedIcon className={styles["feature-icon"]} />
            <div>
              <h3 className={styles["feature-title"]}>Generátor hesel</h3>
              <p className={styles["feature-desc"]}>Vytvořte si silné a bezpečné heslo během pár vteřin..</p>
            </div>
          </div>
          <div className={styles["feature-box"]}>
            <DevicePhoneMobileIcon className={styles["feature-icon"]} />
            <div>
              <h3 className={styles["feature-title"]}>Snadné použití</h3>
              <p className={styles["feature-desc"]}>Intuitivní rozhraní pro jednoduchou správu hesel.</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles["landing-right"]}>
        <div className={styles["floating-cards"]}>
          <div className={`${styles["card"]} ${styles["dashboard-card"]}`}>
            <img
              src="images/screenshot-dashboard.png"
              alt="Dashboard"
              className={styles["card-image"]}
            />
          </div>
          <div className={`${styles["card"]} ${styles["action-card"]}`}>
            <img
              src="/images/login.png"
              alt="Přihlašovací obrazovka"
              className={styles["card-image"]}
            />
          </div>
          <div className={`${styles["card"]} ${styles["service-card"]}`}>
            <img
              src="images/screenshot-service.png"
              alt="Služba detail"
              className={styles["card-image"]}
            />
          </div>
          <div className={`${styles["card"]} ${styles["register-card"]}`}>
            <img
              src="/images/register.png"
              alt="Registrační obrazovka"
              className={styles["card-image"]}
            />
          </div>
          <div className={`${styles["card"]} ${styles["add-card"]}`}>
            <img
              src="images/screenshot-add.png"
              alt="Přidat obrazovku"
              className={styles["card-image"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;