FROM node:20.18

WORKDIR /app
COPY . .

RUN npm install
CMD ["npm", "run", "dev"]