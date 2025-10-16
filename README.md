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
- **SQLite / SQLAlchemy** – databázová vrstva  
- **cryptography (Fernet)** – šifrování a dešifrování hesel  
- **HTML, CSS, JavaScript** – uživatelské rozhraní  
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
python -m venv venv
source venv/bin/activate  # nebo venv\Scripts\activate na Windows
pip install -r requirements.txt
python app.py
```

Aplikace poběží na adrese:
```
http://127.0.0.1:5000
```

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