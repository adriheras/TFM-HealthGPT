# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json into the Docker image
COPY package*.json ./

# Install application dependencies inside the Docker image
RUN npm install

# Copy the rest of the application files into the Docker image
COPY . .

# Expose port 3002 for the application
EXPOSE 3001

# Define the command to run the application
CMD [ "node", "index.js" ]