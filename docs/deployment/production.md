# Production Deployment Guide

This guide provides a recommended approach for deploying Kafka UI to a production environment using Docker.

## 1. Prerequisites

- A server with **Docker** and **Docker Compose** installed.
- A **PostgreSQL database** accessible from your server.
- A **reverse proxy** like Nginx to handle SSL and routing.
- Your own **domain name** and **SSL certificates**.

## 2. Architecture

The recommended production architecture consists of three main components running in Docker containers:

1.  **Backend Service**: The Go application.
2.  **Frontend Service**: The static React files served by Nginx.
3.  **Reverse Proxy**: A top-level Nginx instance that routes traffic to the frontend and backend services and handles SSL termination.

```
Internet -> (443) -> Reverse Proxy (Nginx)
                      |
                      |-> / -> Frontend Service (Nginx)
                      |
                      |-> /api/ -> Backend Service (Go)
```

## 3. Configuration

### Backend Configuration
Create a `config.prod.yml` file for your production backend configuration. This file should **not** be checked into version control.

**`config.prod.yml`:**
```yaml
database:
  host: "your-production-db-host"
  port: 5432
  user: "your-db-user"
  password: "your-db-password"
  dbname: "kafka_ui_db"

jwt:
  secret: "a-very-long-and-secure-random-string-for-jwt"

server:
  port: 8080 # This port is internal to Docker
  gin_mode: "release"

kafka:
  clusters:
    - name: "production-cluster"
      bootstrap_servers: "kafka1:9092,kafka2:9092"
      # Add any necessary security configurations (SASL/TLS) here
```

### Docker Compose
Create a `docker-compose.prod.yml` file for your production services.

**`docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    restart: always
    volumes:
      - ./config.prod.yml:/app/config.yml
    expose:
      - "8080"
    networks:
      - kafka-ui-net

  frontend:
    build:
      context: ./frontend
    restart: always
    expose:
      - "80"
    networks:
      - kafka-ui-net

networks:
  kafka-ui-net:
    driver: bridge
```

### Reverse Proxy (Nginx)
Create an `nginx.conf` file for your reverse proxy.

**`nginx.conf`:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Deployment Steps

1.  **Place Files on Server**: Copy the entire project, your `config.prod.yml`, and your `nginx.conf` to your production server.

2.  **Build and Start Services**:
   ```bash
    docker-compose -f docker-compose.prod.yml up --build -d
    ```

3.  **Configure Reverse Proxy**:
    - Place your `nginx.conf` file in the appropriate Nginx directory (e.g., `/etc/nginx/sites-available/`).
    - Place your SSL certificates on the server and update the paths in `nginx.conf`.
    - Enable the site and restart Nginx.

## 5. Security Considerations

- **Database**: Ensure your database is secured and only accessible from your application server.
- **JWT Secret**: Use a long, complex, and unique string for your JWT secret.
- **Kafka Security**: Configure TLS and SASL for your Kafka connections in `config.prod.yml`.
- **Firewall**: Restrict access to your server on all ports except for `80` and `443`.
- **Regular Updates**: Keep your server, Docker, and all application dependencies up to date.