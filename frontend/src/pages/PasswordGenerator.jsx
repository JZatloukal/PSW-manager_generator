import { useState } from "react";
import { 
  KeyIcon, 
  ClipboardDocumentIcon, 
  EyeIcon, 
  EyeSlashIcon
} from '@heroicons/react/24/solid';
import { useNotification } from '../contexts/NotificationContext';
import Tooltip from '../components/Tooltip';
import styles from "./PasswordGenerator.module.css";

export default function PasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { showNotification } = useNotification();


  const generatePassword = () => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      showNotification("Musíte vybrat alespoň jeden typ znaků!", "error");
      return;
    }

    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(password);
    showNotification("Heslo bylo vygenerováno", "success");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      showNotification("Heslo bylo zkopírováno do schránky", "success");
    } catch (err) {
      showNotification("Nepodařilo se zkopírovat heslo", "error");
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { strength: score, label: "Slabé", color: "#ef4444" };
    if (score <= 4) return { strength: score, label: "Střední", color: "#f59e0b" };
    if (score <= 6) return { strength: score, label: "Silné", color: "#10b981" };
    return { strength: score, label: "Velmi silné", color: "#16a34a" };
  };

  const strength = getPasswordStrength(generatedPassword);

  return (
    <div className={styles["generator-container"]}>

      <div className={`${styles["card"]} ${styles["main-generator-box"]} ${styles["card-box"]}`}>
        <div className={styles["split-container"]}>
          {/* Levá strana - nastavení */}
          <div className={styles["settings-section"]}>
            <div className={styles["card-header"]}>
              <KeyIcon className={styles["header-icon"]} />
              <h2 className={styles["card-title"]}>Vytvořte si své heslo</h2>
            </div>

            {/* Délka hesla */}
            <div className={styles["setting-group"]}>
              <label className={styles["setting-label"]}>
                Délka hesla: <span className={styles["length-value"]}>{passwordLength}</span>
              </label>
              <div className={styles["slider-container"]}>
                <div 
                  className={styles["slider-progress"]}
                  style={{
                    width: `${((passwordLength - 4) / (50 - 4)) * 100}%`,
                    transition: isDragging ? 'none' : 'width 0.1s ease-out'
                  }}
                />
                <input
                  type="range"
                  min="4"
                  max="50"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className={styles["length-slider"]}
                />
              </div>
              <div className={styles["length-labels"]}>
                <span>4</span>
                <span>50</span>
              </div>
            </div>

            {/* Typy znaků */}
            <div className={styles["charset-section"]}>
              <div className={styles["toggle-group"]}>
                <div className={styles["toggle-item"]}>
                  <span className={styles["toggle-label"]}>
                    Velká písmena
                    <Tooltip content="A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z">
                      <span className={styles["tooltip-icon"]}>?</span>
                    </Tooltip>
                  </span>
                  <label className={styles["toggle-switch"]}>
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className={styles["toggle-input"]}
                    />
                    <span className={styles["toggle-slider"]}></span>
                  </label>
                </div>
                
                <div className={styles["toggle-item"]}>
                  <span className={styles["toggle-label"]}>
                    Malá písmena
                    <Tooltip content="a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z">
                      <span className={styles["tooltip-icon"]}>?</span>
                    </Tooltip>
                  </span>
                  <label className={styles["toggle-switch"]}>
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                      className={styles["toggle-input"]}
                    />
                    <span className={styles["toggle-slider"]}></span>
                  </label>
                </div>
                
                <div className={styles["toggle-item"]}>
                  <span className={styles["toggle-label"]}>
                    Čísla
                    <Tooltip content="0, 1, 2, 3, 4, 5, 6, 7, 8, 9">
                      <span className={styles["tooltip-icon"]}>?</span>
                    </Tooltip>
                  </span>
                  <label className={styles["toggle-switch"]}>
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className={styles["toggle-input"]}
                    />
                    <span className={styles["toggle-slider"]}></span>
                  </label>
                </div>
                
                <div className={styles["toggle-item"]}>
                  <span className={styles["toggle-label"]}>
                    Speciální znaky
                    <Tooltip content="!, @, #, $, %, ^, &, *, (, ), -, _, +, =, [, ], {, }, |, \, :, ;, ', &quot;, &lt;, &gt;, ?, /, ~, `">
                      <span className={styles["tooltip-icon"]}>?</span>
                    </Tooltip>
                  </span>
                  <label className={styles["toggle-switch"]}>
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className={styles["toggle-input"]}
                    />
                    <span className={styles["toggle-slider"]}></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Generovat tlačítko */}
            <button 
              onClick={generatePassword}
              className={styles["generate-button"]}
            >
              Vygenerovat heslo
            </button>
          </div>

          {/* Pravá strana - výsledek */}
          <div className={styles["result-section"]}>
            <div className={styles["result-header"]}>
              <svg className={styles["result-icon"]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <h3 className={styles["card-title"]}>Vygenerované heslo</h3>
            </div>
            
            {generatedPassword ? (
              <div className={styles["password-result"]}>
                {/* Password display - nahoře */}
                <div className={`${styles["password-display"]} ${styles["animate-in"]}`}>
                  <div className={styles["password-field"]}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword}
                      readOnly
                      className={styles["password-input"]}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles["toggle-button"]}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className={styles["icon"]} />
                      ) : (
                        <EyeIcon className={styles["icon"]} />
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={copyToClipboard}
                    className={styles["copy-button"]}
                  >
                    <ClipboardDocumentIcon className={styles["button-icon"]} />
                    Kopírovat
                  </button>
                </div>

                {/* Strength meter */}
                <div className={`${styles["strength-section"]} ${styles["animate-in"]}`}>
                  <div className={styles["strength-label"]}>
                    Síla hesla: <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div className={styles["strength-meter"]}>
                    <div 
                      className={styles["strength-bar"]}
                      style={{ 
                        width: `${(strength.strength / 7) * 100}%`,
                        backgroundColor: strength.color
                      }}
                    />
                  </div>
                </div>

                {/* Password info - dole */}
                <div className={`${styles["password-info"]} ${styles["animate-in"]}`}>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Délka:</span>
                    <span className={styles["info-value"]}>{generatedPassword.length} znaků</span>
                  </div>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Typy znaků:</span>
                    <span className={styles["info-value"]}>
                      {[includeUppercase && 'A-Z', includeLowercase && 'a-z', includeNumbers && '0-9', includeSymbols && '!@#$'].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Entropie:</span>
                    <span className={styles["info-value"]}>
                      {Math.round(generatedPassword.length * Math.log2(
                        (includeUppercase ? 26 : 0) + 
                        (includeLowercase ? 26 : 0) + 
                        (includeNumbers ? 10 : 0) + 
                        (includeSymbols ? 32 : 0)
                      ))} bitů
                    </span>
                  </div>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Počet možností:</span>
                    <span className={styles["info-value"]}>
                      {(() => {
                        if (!generatedPassword) return "0";
                        
                        const length = generatedPassword.length;
                        const charsetTypes = (includeUppercase ? 1 : 0) + 
                                           (includeLowercase ? 1 : 0) + 
                                           (includeNumbers ? 1 : 0) + 
                                           (includeSymbols ? 1 : 0);
                        
                        if (charsetTypes === 0) return "0";
                        
                        // Jednoduché textové popisy podle délky a typů znaků
                        if (length <= 4) return "Tisíce";
                        if (length <= 6) return "Miliony";
                        if (length <= 8) return "Miliardy";
                        if (length <= 10) return "Biliony";
                        if (length <= 12) return "Kvadriliony";
                        if (length <= 14) return "Kvintiliony";
                        if (length <= 16) return "Sextiliony";
                        if (length <= 18) return "Septiliony";
                        if (length <= 20) return "Oktiliony";
                        if (length <= 22) return "Noniliony";
                        if (length <= 24) return "Deciliony";
                        return "Astronomické množství";
                      })()}
                    </span>
                  </div>
                  <div className={styles["info-item"]}>
                    <span className={styles["info-label"]}>Doba prolomení:</span>
                    <span className={styles["info-value"]}>
                      {(() => {
                        if (!generatedPassword) return "Okamžitě";
                        
                        const length = generatedPassword.length;
                        const charsetTypes = (includeUppercase ? 1 : 0) + 
                                           (includeLowercase ? 1 : 0) + 
                                           (includeNumbers ? 1 : 0) + 
                                           (includeSymbols ? 1 : 0);
                        
                        if (charsetTypes === 0) return "Okamžitě";
                        
                        // Jednoduché textové popisy podle délky
                        if (length <= 4) return "Okamžitě";
                        if (length <= 6) return "Sekundy až minuty";
                        if (length <= 8) return "Hodiny až dny";
                        if (length <= 10) return "Dny až roky";
                        if (length <= 12) return "Roky až staletí";
                        if (length <= 14) return "Staletí až tisíciletí";
                        if (length <= 16) return "Tisíciletí až miliony let";
                        if (length <= 18) return "Miliony až miliardy let";
                        if (length <= 20) return "Miliardy až biliony let";
                        if (length <= 22) return "Biliony až kvadriliony let";
                        if (length <= 24) return "Kvadriliony až kvintiliony let";
                        return "Více než věk vesmíru";
                      })()}
                    </span>
                  </div>
                </div>

                {/* Tips section */}
                <div className={`${styles["tips-section"]} ${styles["animate-in"]}`}>
                  <div className={styles["tips-header"]}>
                    <span className={styles["tips-icon"]}>💡</span>
                    <span className={styles["tips-title"]}>Tipy pro bezpečnost</span>
                  </div>
                  <div className={styles["tips-content"]}>
                    <p>• Použijte 2FA pro ještě větší bezpečnost</p>
                    <p>• Nikdy nesdílejte hesla přes email nebo chat</p>
                    <p>• Pravidelně měňte hesla každé 3-6 měsíců</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles["empty-state"]}>
                <p>Klikněte na "Vygenerovat heslo" pro vytvoření nového hesla</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}