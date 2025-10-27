# Password Manager & Generator

Password Manager & Generator je bezpečná webová aplikace pro správu a generování hesel.  
Projekt je postaven na frameworku Flask a slouží jako ukázka moderního backendového řešení se šifrováním dat, validací vstupů a rozšiřitelnou API architekturou.

---

## Popis projektu

Aplikace umožňuje ukládat, šifrovat a spravovat uživatelská hesla pomocí bezpečnostní knihovny **cryptography (Fernet)**.  
Součástí je také **generátor silných hesel** s nastavitelnými parametry (délka, speciální znaky, čísla, velká písmena).  
Rozhraní je navrženo jednoduše a přehledně, s důrazem na bezpečnost, použitelnost a čistý kód.

---

## Technologie

- **Python (Flask)** – backend aplikace  
- **PostgreSQL / SQLAlchemy** – databázová vrstva v produkci (lokálně SQLite)  
- **cryptography (Fernet)** – šifrování a dešifrování hesel  
- **React + Vite** – uživatelské rozhraní  
- **pytest** – unit testy hlavních endpointů  
- **Werkzeug Security** – hashování uživatelských přihlašovacích údajů  
- **Blueprints a modulární struktura** – přehledné oddělení logiky aplikace  

---

## Funkce

- Ukládání hesel do zabezpečené databáze  
- Šifrování a dešifrování hesel pomocí Fernet  
- Validace vstupů a kontrola síly hesla  
- Generátor náhodných hesel s možností přizpůsobení  
- Registrace a přihlášení uživatele  
- CRUD operace nad uloženými záznamy  
- REST API rozhraní pro externí použití  
- Testovací sada pro hlavní funkce aplikace  

---

## Roadmapa vývoje

- [x] Implementace šifrování pomocí Fernet  
- [x] Generátor silných hesel  
- [x] Validace vstupů (formát e-mailu, délka hesla, síla hesla)  
- [x] Unit testy hlavních endpointů (pytest)  
- [x] Refaktor do modulární struktury  
- [ ] Dvoufaktorové ověření (2FA)  
- [ ] Export a import hesel (CSV / JSON)  
- [ ] Možnost ukládat poznámky k heslům  
- [x] Nasazení na veřejný server (např. Railway nebo Render)  
- [x] Webové rozhraní v Reactu  
- [ ] Dark mode  

---

## Lokální spuštění

```bash
git clone https://github.com/JZatloukal/password-manager.git
cd password-manager

# Backend
python -m venv venv
source venv/bin/activate  # nebo venv\Scripts\activate na Windows
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
npm run dev
```

Backend lze spustit paralelně v dalším terminálu:
```bash
source venv/bin/activate  # aktivuj virtuální prostředí
export FLASK_APP=backend.app
export FLASK_ENV=development
flask run --port 5001
```

Frontend běží standardně na `http://localhost:5173`, backend na `http://127.0.0.1:5001`.

---

## Nasazení na Railway

1. Vytvoř `.env` soubor podle `.env.example` a nastav proměnné v Railway prostředí:  
   - `DATABASE_URL` (Railway PostgreSQL URL)  
   - `SECRET_KEY` a `JWT_SECRET_KEY` (libovolné bezpečné řetězce)  
   - `FERNET_KEY` (vygeneruj například `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)  
   - `FLASK_ENV=production`
2. Připoj GitHub repozitář k Railway a zvol „Deploy from GitHub“.  
3. V nastavení služby zadej build command:  
   ```
   pip install -r backend/requirements.txt && npm --prefix frontend ci && npm --prefix frontend run build
   ```
4. Start command nastav na:  
   ```
   gunicorn backend.app:app --bind 0.0.0.0:${PORT:-8080}
   ```
5. Po deployi otevři přidělenou doménu, frontend build se servíruje přímo Flask backendem.

> Dockerfile v repozitáři je připraven pro případné Docker deploymenty; Railway může využít buď Docker, nebo výše uvedené build/start příkazy.

---

## Testování

Spuštění testů pomocí pytest:
```bash
pytest
```

---

## Autor

Projekt vytvořil **Jan Zatloukal**  
Portfolio: [https://jzatloukal.github.io/portfolio_Jan_Zatloukal/](https://jzatloukal.github.io/portfolio_Jan_Zatloukal/)  
GitHub: [https://github.com/JZatloukal](https://github.com/JZatloukal)

---

## Licence

Tento projekt je zveřejněn pod licencí **MIT**.  
Volně použitelný pro osobní i komerční účely s uvedením autora.
