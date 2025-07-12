FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm install pm2 -g

EXPOSE 6723

CMD ["pm2-runtime", "ecosystem.config.js"]