# Description: Dockerfile for the Deno application
FROM denoland/deno:2.1.2

# Set the working directory
WORKDIR /usr/src/app

RUN chown -R deno:deno /usr/src/app

# Use non-root user
USER deno

# Copy package.json and yarn.lock to install dependencies
COPY package.json deno.json deno.lock ./

# Copy the rest of the application files
COPY . .

# Install dependencies
RUN deno install --lock=deno.lock --frozen=true --allow-scripts=npm:protobufjs@7.4.0,npm:es5-ext@0.10.64

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/index.ts

# Run the application
CMD ["run", "--allow-read", "--allow-env", "--allow-net", "./src/index.ts"]
