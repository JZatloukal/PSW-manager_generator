import { useEffect, useRef, useState } from "react";
import { GlobeAltIcon, UserIcon, KeyIcon } from '@heroicons/react/24/solid';
import styles from "./Dashboard.module.css";
import { API_URL } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";


export default function Dashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState([]);
  const [passwordsLoading, setPasswordsLoading] = useState(false);

  const [newService, setNewService] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const notificationRef = useRef(showNotification);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  const nextStep = () => {
    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    }
  };

  const prevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setNewService("");
    setNewUsername("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setIsAddOpen(false);
  };

  const getColorForService = (service) => {
    const gradients = [
      "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", // modrá
      "linear-gradient(135deg, #9333ea 0%, #5b21b6 100%)", // fialová
      "linear-gradient(135deg, #059669 0%, #065f46 100%)", // zelená
      "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", // tyrkys
      "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // oranžová decentní
      "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)", // červená (pro kontrast)
      "linear-gradient(135deg, #64748b 0%, #334155 100%)", // šedá/tech
      "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)", // teal
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // svěží modrá
      "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)"  // deep purple
    ];
    if (!service) return gradients[0];
    const charCode = service.charCodeAt(0);
    const index = charCode % gradients.length;
    return gradients[index];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Nejste přihlášen");
      return;
    }

    setPasswordsLoading(true);
    fetch(`${API_URL}/passwords`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          const errorMessage = payload?.message || payload?.error || "Nepodařilo se načíst hesla.";
          throw new Error(errorMessage);
        }
        if (!Array.isArray(payload)) {
          throw new Error("Neočekávaná odpověď serveru.");
        }
        return payload;
      })
      .then(passwordData => {
        // Mapování dat z backendu na frontend strukturu
        setMessage("");
        const mappedPasswords = passwordData.map(pwd => ({
          id: pwd.id,
          service: pwd.site,  // backend vrací 'site', frontend očekává 'service'
          login: pwd.username, // backend vrací 'username', frontend očekává 'login'
          password: '*****' // heslo se nezobrazuje v seznamu
        }));
        setPasswords(mappedPasswords);
      })
      .catch((err) => {
        setMessage(err.message);
        notificationRef.current?.(err.message, "error");
        setPasswords([]);
      })
      .finally(() => {
        setPasswordsLoading(false);
      });
  }, []);


  const handleAddPassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Nejste přihlášen", "error");
      return;
    }
    if (!newService || !newUsername || !newPassword) {
      showNotification("Vyplňte všechny údaje", "error");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showNotification("Hesla se neshodují", "error");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(`${API_URL}/passwords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          site: newService,
          username: newUsername,
          password: newPassword,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        const message = data?.message || data?.error || "Chyba při přidávání hesla";
        showNotification(message, "error");
        return;
      }

      setPasswords(prev => [
        ...prev,
        {
          id: data.id,
          service: newService,
          login: newUsername,
          password: newPassword
        }
      ]);
      resetWizard();
      showNotification("Heslo bylo úspěšně přidáno", "success");
    } catch (error) {
      showNotification("Chyba při přidávání hesla", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleCopyPassword = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Nejste přihlášen", "error");
      return;
    }

    try {
      // Načtení skutečného hesla z backendu
      const response = await fetch(`${API_URL}/passwords/${id}/reveal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => null);
      
      if (!response.ok || !data || !data.password) {
        const message = data?.message || data?.error || "Nepodařilo se načíst heslo.";
        showNotification(message, "error");
        return;
      }
      
      await navigator.clipboard.writeText(data.password);
      showNotification("Heslo bylo zkopírováno", "success");
    } catch (err) {
      showNotification("Nepodařilo se zkopírovat heslo", "error");
    }
  };

  const handleDeletePassword = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Nejste přihlášen", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/passwords/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message || data?.error || "Chyba při mazání hesla";
        showNotification(message, "error");
        return;
      }

      setPasswords(prev => prev.filter(p => p.id !== id));
      showNotification("Heslo bylo smazáno", "success");
    } catch (err) {
      showNotification("Chyba při mazání hesla", "error");
    }
  };

  const isUrl = (text) => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(text);

  return (
    <div className={styles["dashboard-container"]}>
      
        {message && <p className={styles["error-text"]}>{message}</p>}
        {user && (
          <>
            <div className={styles["card"]}>
              <div className={styles["profile-content"]}>
                <div className={styles["profile-avatar"]}>{user?.username?.charAt(0)?.toUpperCase()}</div>
                <div className={styles["profile-info"]}>
                  <h3 className={styles["profile-name"]}>{user?.username}</h3>
                  <div className={styles["profile-stats"]}>
                    <p className={styles["profile-stat"]}>Členem od: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}</p>
                    <p className={styles["profile-stat"]}>Email: {user?.email}</p>
                    <p className={styles["profile-stat"]}>Počet hesel: {passwords.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles["card"]}>
              <div className={styles["card-header"]}>
                <h3 className={styles["card-title"]}>Uložená hesla</h3>
              </div>
              {passwordsLoading && <p className={styles["info-text"]}>Načítám hesla...</p>}
              {!passwordsLoading && (
                passwords.length > 0 ? (
                  <div className={styles["password-grid"]}>
                    {passwords.map((pwd) => {
                      return (
                        <div key={pwd.id} className={`${styles["password-card"]} ${styles["card-box"]}`}>
                          <div className={styles["password-icon"]} style={{ background: getColorForService(pwd.service) }}>
                            {pwd.service.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles["password-details"]}>
                            <div className={styles["password-field"]}>
                              <span className={styles["field-label"]}>{isUrl(pwd.service) ? "URL adresa:" : "Služba:"}</span>
                              <span className={styles["field-value"]}>{pwd.service}</span>
                            </div>
                            <div className={styles["password-field"]}>
                              <span className={styles["field-label"]}>Uživatelské jméno:</span>
                              <span className={styles["field-value"]}>{pwd.login}</span>
                            </div>
                            <div className={styles["password-field"]}>
                              <span className={styles["field-label"]}>Heslo:</span>
                              <span className={styles["password-value"]}>*****</span>
                            </div>
                          </div>
                          <div className={styles["password-actions"]}>
                            <button className={styles["password-btn"]} onClick={() => handleCopyPassword(pwd.id)}>Kopírovat</button>
                            <button className={styles["password-btn"]} onClick={() => handleDeletePassword(pwd.id)}>Smazat</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`${styles["info-text"]} ${styles["empty-state"]}`}></p>
                )
              )}
            </div>
            <div className={`${styles["card"]} ${styles["add-password"]} ${styles["card-box"]}`}>
              <div className={styles["accordion-header"]} onClick={() => setIsAddOpen(!isAddOpen)}>
                <h3>Přidat nové heslo</h3>
                <span className={`${styles["accordion-arrow"]} ${isAddOpen ? styles["open"] : ""}`}>▼</span>
              </div>
              {isAddOpen && (
                <div className={styles["wizard-container"]}>
                  {/* Wizard Steps */}
                  <div className={styles["wizard-content"]}>
                    {wizardStep === 1 && (
                      <div className={styles["wizard-step"]}>
                        
                        {/* Progress Bar */}
                        <div className={styles["wizard-progress"]}>
                          <div className={styles["progress-bar"]}>
                            <div 
                              className={styles["progress-fill"]}
                              style={{ width: `${(wizardStep / 2) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className={styles["floating-input-group"]}>
                          <GlobeAltIcon className={styles["floating-icon"]} />
                          <input
                            type="text"
                            id="service"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            className={styles["floating-input"]}
                            placeholder=" "
                            required
                          />
                          <label htmlFor="service" className={styles["floating-label"]}>
                            URL adresa nebo název služby
                          </label>
                        </div>
                        <div className={styles["floating-input-group"]}>
                          <UserIcon className={styles["floating-icon"]} />
                          <input
                            type="text"
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className={styles["floating-input"]}
                            placeholder=" "
                            required
                          />
                          <label htmlFor="username" className={styles["floating-label"]}>
                            Uživatelské jméno
                          </label>
                        </div>
                        <div className={styles["floating-input-group"]}>
                          <KeyIcon className={styles["floating-icon"]} />
                          <input
                            type="password"
                            id="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles["floating-input"]}
                            placeholder=" "
                            required
                          />
                          <label htmlFor="password" className={styles["floating-label"]}>
                            Heslo
                          </label>
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className={styles["wizard-step"]}>
                        
                        {/* Progress Bar */}
                        <div className={styles["wizard-progress"]}>
                          <div className={styles["progress-bar"]}>
                            <div 
                              className={styles["progress-fill"]}
                              style={{ width: `${(wizardStep / 2) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className={styles["floating-input-group"]}>
                          <KeyIcon className={styles["floating-icon"]} />
                          <input
                            type="password"
                            id="confirmPassword"
                            value={newPasswordConfirm}
                            onChange={(e) => setNewPasswordConfirm(e.target.value)}
                            className={styles["floating-input"]}
                            placeholder=" "
                            required
                          />
                          <label htmlFor="confirmPassword" className={styles["floating-label"]}>
                            Potvrďte heslo
                          </label>
                        </div>
                        <div className={styles["summary"]}>
                          <h4>Shrnutí</h4>
                          <p><strong>Služba:</strong> {newService}</p>
                          <p><strong>Uživatelské jméno:</strong> {newUsername}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className={styles["wizard-navigation"]}>
                    {wizardStep > 1 && (
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className={styles["wizard-button"]}
                      >
                        ← Zpět
                      </button>
                    )}
                    
                    {wizardStep < 2 ? (
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className={styles["wizard-button"]}
                        disabled={!newService || !newUsername || !newPassword}
                      >
                        Další →
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleAddPassword}
                        disabled={adding || newPassword !== newPasswordConfirm}
                        className={styles["wizard-button"]}
                      >
                        {adding ? "Přidávám..." : "Dokončit"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      
    </div>
  );
}
