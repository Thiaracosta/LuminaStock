# Usa a imagem oficial leve do Node.js 20
FROM node:20-alpine

# Instala o OpenSSL (necessário para o Prisma funcionar no Linux Alpine)
RUN apk add --no-cache openssl

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências e a pasta do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo o tsx e o prisma)
RUN npm ci

# Gera o cliente do Prisma para o Linux do container
RUN npx prisma generate

# Copia o restante do código da API (src, openapi.yaml, tsconfig.json, etc.)
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Aplica as migrações no banco e inicia o servidor com o seu script "start"
CMD ["npm", "start"]