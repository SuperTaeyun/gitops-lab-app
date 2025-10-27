# Node.js 20 LTS, 런타임만
FROM node:20-alpine
WORKDIR /app

# 의존성 먼저 복사→캐시 최적화
COPY package*.json ./
RUN npm ci --omit=dev

# 앱 소스
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
