# Frontend Dockerfile
FROM node:18-alpine

# Nastavit pracovní adresář
WORKDIR /app

# Kopírovat package.json a package-lock.json
COPY package*.json ./

# Nainstalovat závislosti
RUN npm ci --only=production

# Kopírovat zdrojový kód
COPY . .

# Exponovat port
EXPOSE 3000

# Nastavit environment proměnnou pro API URL
ENV REACT_APP_API_URL=http://localhost:5001/api

# Spustit development server
CMD ["npm", "start"]
