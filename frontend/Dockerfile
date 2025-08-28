# Stage 1: Build the React application using an ECR Public Node.js image
FROM public.ecr.aws/docker/library/node:18-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using an ECR Public Nginx image
FROM public.ecr.aws/docker/library/nginx:1.23-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
