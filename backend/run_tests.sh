#!/bin/bash

# Testovací script pro celý projekt
set -e

echo "🧪 SPOUŠTÍM TESTOVACÍ SUITE"
echo "================================"

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkce pro výpis výsledků
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# 1. Backend testy
echo -e "\n${BLUE}🔧 Backend testy${NC}"
echo "-------------------"

cd backend
source venv/bin/activate

# Instalace testovacích závislostí
echo "📦 Instaluji testovací závislosti..."
pip install -r requirements.txt > /dev/null 2>&1

# Spuštění backend testů
echo "🧪 Spouštím backend testy..."
python3 -m pytest ../tests/backend/ -v --tb=short
print_result $? "Backend testy"

# Coverage report
echo "📊 Generuji coverage report..."
python3 -m pytest ../tests/backend/ --cov=backend --cov-report=html --cov-report=term-missing
print_result $? "Backend coverage"

deactivate
cd ..

# 2. Frontend testy
echo -e "\n${BLUE}🌐 Frontend testy${NC}"
echo "-------------------"

cd frontend

# Instalace závislostí
echo "📦 Instaluji frontend závislosti..."
npm install > /dev/null 2>&1

# Spuštění frontend testů
echo "🧪 Spouštím frontend testy..."
npm run test:ci
print_result $? "Frontend testy"

cd ..

# 3. Integrační testy
echo -e "\n${BLUE}🔗 Integrační testy${NC}"
echo "-------------------"

# Spuštění aplikace na pozadí
echo "🚀 Spouštím aplikaci pro integrační testy..."
./dev_start.sh > /dev/null 2>&1 &
APP_PID=$!

# Čekání na spuštění
echo "⏳ Čekám na spuštění aplikace..."
sleep 10

# Test API endpointů
echo "🔍 Testuji API endpointy..."

# Test backend API
if curl -s http://localhost:8000/api/test | grep -q "Backend OK"; then
    print_result 0 "Backend API"
else
    print_result 1 "Backend API"
fi

# Test frontend
if curl -s http://localhost:3000 | grep -q "html"; then
    print_result 0 "Frontend"
else
    print_result 1 "Frontend"
fi

# Test CORS
echo "🔒 Testuji CORS..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: http://localhost:3000" -X OPTIONS http://localhost:8000/api/login)
if [ "$CORS_RESPONSE" = "200" ]; then
    print_result 0 "CORS konfigurace"
else
    print_result 1 "CORS konfigurace"
fi

# Zastavení aplikace
echo "🛑 Zastavuji aplikaci..."
kill $APP_PID 2>/dev/null || true

# 4. Shrnutí
echo -e "\n${GREEN}🎉 VŠECHNY TESTY PROŠLY ÚSPĚŠNĚ!${NC}"
echo "================================"
echo -e "${YELLOW}📊 Výsledky:${NC}"
echo "  ✅ Backend unit testy"
echo "  ✅ Backend coverage report"
echo "  ✅ Frontend testy"
echo "  ✅ Integrační testy"
echo "  ✅ API endpointy"
echo "  ✅ CORS konfigurace"
echo ""
echo -e "${BLUE}📁 Coverage reporty:${NC}"
echo "  📄 Backend: backend/htmlcov/index.html"
echo "  📄 Frontend: frontend/coverage/lcov-report/index.html"
echo ""
echo -e "${GREEN}🚀 Projekt je připraven k nasazení!${NC}"
