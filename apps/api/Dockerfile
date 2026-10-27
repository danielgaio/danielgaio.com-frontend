# Select the application image
FROM node:latest

# Specify the work directory of the application
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy my project's content to inside the container's image
# copies from this folder to the WORKDIR
COPY . .
# Copy the production .env renaming to a normal .env
COPY ./.env.production ./.env

# Install dependencies
RUN pnpm install --quiet --no-optional
RUN pnpm run build

EXPOSE 3000

# Run the application in production mode
CMD ["pnpm", "run", "start:prod"]