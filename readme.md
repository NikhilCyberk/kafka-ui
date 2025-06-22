# Kafka UI - Modern Kafka Management Interface

A comprehensive web-based interface for managing Apache Kafka clusters, built with Go backend and React frontend.

## Table of Contents
- [🚀 Features](#-features)
- [📁 Project Structure](#-project-structure)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🚀 Features

- **Multi-Cluster Management**: Seamlessly connect to and manage multiple Kafka clusters from a single interface.
- **Cluster Overview**: Get a high-level overview of your cluster's health, including broker count, topic count, and consumer group status.
- **Broker Monitoring**: View a list of all brokers in your cluster, along with their status and configuration.
- **Topic Management**: Create, delete, and inspect topics. View partition details, replication factors, and in-sync replicas.
- **Message Explorer**: Consume messages from any topic. View message details including key, value, offset, and timestamp.
- **Message Production**: Produce messages to any topic, specifying the key, value, and partition.
- **Consumer Group Monitoring**: Monitor all consumer groups, track consumer lag in real-time, and view member details.
- **Advanced Metrics**: A dedicated metrics dashboard providing detailed insights into cluster health, broker performance, topic throughput, and consumer group lag.
- **User Authentication**: Secure your UI with a complete authentication system (login, signup, profile management).
- **Modern UI/UX**: A clean, responsive, and intuitive user interface built with Material UI, featuring both dark and light modes.

## 🖼️ Screenshots

A quick look at the Kafka UI in action.

| Login Page | Dashboard Welcome |
| :---: | :---: |
| ![Login](frontend/public/screenshots/Screenshot%202025-06-22%20152004.png) | ![Dashboard](frontend/public/screenshots/Screenshot%202025-06-22%20152059.png) |

| Cluster Management | Cluster Overview |
| :---: | :---: |
| ![Cluster Management](frontend/public/screenshots/Screenshot%202025-06-22%20152127.png) | ![Cluster Overview](frontend/public/screenshots/Screenshot%202025-06-22%20152151.png) |

| Brokers Page | Topics Page |
| :---: | :---: |
| ![Brokers](frontend/public/screenshots/Screenshot%202025-06-22%20152206.png) | ![Topics](frontend/public/screenshots/Screenshot%202025-06-22%20152223.png) |

| Topic Details | Topic Configuration |
| :---: | :---: |
| ![Topic Details](frontend/public/screenshots/Screenshot%202025-06-22%20152237.png) | ![Topic Configuration](frontend/public/screenshots/Screenshot%202025-06-22%20152251.png) |

| Message Explorer | Produce Message |
| :---: | :---: |
| ![Message Explorer](frontend/public/screenshots/Screenshot%202025-06-22%20152334.png) | ![Produce Message](frontend/public/screenshots/Screenshot%202025-06-22%20152349.png) |

| Consumer Groups | Consumer Group Details |
| :---: | :---: |
| ![Consumer Groups](frontend/public/screenshots/Screenshot%202025-06-22%20152406.png) | ![Consumer Group Details](frontend/public/screenshots/Screenshot%202025-06-22%20152423.png) |

| Cluster Metrics | Topic Metrics |
| :---: | :---: |
| ![Cluster Metrics](frontend/public/screenshots/Screenshot%202025-06-22%20152444.png) | ![Topic Metrics](frontend/public/screenshots/Screenshot%202025-06-22%20152457.png) |

## �� Project Structure

```
kafka-ui/
├── 📁 backend/
│   ├── 📁 cmd/server/           # Main server binary
│   ├── 📁 internal/
│   │   ├── 📁 api/             # HTTP API (handlers, middleware, routes)
│   │   ├── 📁 config/          # Configuration management
│   │   ├── 📁 kafka/           # Kafka client and services
│   │   └── 📁 models/          # Data models and types
│   ├── 📁 pkg/                 # Public packages (errors, utils)
│   ├── config.yml              # Application configuration
│   └── go.mod                  # Go module dependencies
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Page components for each feature
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 contexts/        # React contexts (Auth, Cluster)
│   │   └── ...                 # Other standard React directories
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite configuration
├── 📁 docs/                     # Project documentation
├── docker-compose.yml          # Full stack development setup
├── Makefile                    # Build and development commands
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **Go 1.21+**: Core language
- **Gin**: HTTP web framework
- **Sarama**: Kafka client library
- **GORM**: Database ORM
- **Viper**: Configuration management
- **JWT**: Authentication tokens

### Frontend
- **React 18**: UI framework
- **Material UI**: Component library
- **React Router**: Client-side routing
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Notistack**: Notification system

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose (optional, but recommended)
- A running Apache Kafka cluster

### Development Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd kafka-ui
    ```

2.  **Configure the Backend**
    - Rename `backend/config.example.yml` to `backend/config.yml`.
    - Update `config.yml` with your database and JWT secret settings.

3.  **Start the Backend**
    ```bash
    cd backend
    go mod download
    go run cmd/server/main.go
    ```

4.  **Start the Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Access the Application**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:8080`

### Docker Setup
The easiest way to get started is with Docker.

```bash
# This will start the backend, frontend, and a Postgres database.
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 API Documentation

The backend provides a RESTful API. All endpoints under `/api` are protected and require a JWT token, except for the `/auth` endpoints.

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user and get a token
- `GET /api/auth/profile` - Get the current user's profile
- `PUT /api/auth/change-password` - Change the current user's password

### Clusters
- `GET /api/clusters` - List all configured clusters
- `POST /api/clusters` - Add a new cluster configuration
- `DELETE /api/clusters/:clusterName` - Remove a cluster configuration

### Topics
- `GET /api/clusters/:clusterName/topics` - List topics
- `POST /api/clusters/:clusterName/topics` - Create a new topic
- `GET /api/clusters/:clusterName/topics/:topicName` - Get topic details
- `DELETE /api/clusters/:clusterName/topics/:topicName` - Delete a topic

### Brokers
- `GET /api/clusters/:clusterName/brokers` - List brokers in the cluster

### Consumer Groups
- `GET /api/clusters/:clusterName/consumer-groups` - List consumer groups
- `GET /api/clusters/:clusterName/consumer-groups/:groupId` - Get group details

### Messages
- `GET /api/clusters/:clusterName/topics/:topicName/messages` - Get messages from a topic
- `POST /api/clusters/:clusterName/topics/:topicName/messages` - Produce a message to a topic

### Metrics
- `GET /api/clusters/:clusterName/metrics/cluster-health` - Overall cluster health
- `GET /api/clusters/:clusterName/metrics/consumer-lag` - Lag for all consumer groups
- `GET /api/clusters/:clusterName/metrics/brokers` - Metrics for all brokers
- `GET /api/clusters/:clusterName/metrics/topics` - Metrics for all topics
- `GET /api/clusters/:clusterName/metrics/consumer-groups` - Detailed metrics for consumer groups

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

1.  **Build the Backend**
    ```bash
    # This creates a binary in the backend/bin directory
    cd backend
    ./scripts/build.sh
    ```

2.  **Build the Frontend**
    ```bash
    cd frontend
    npm run build
    ```
    The production-ready static files will be in the `frontend/dist` directory. You can then serve these files with a web server like Nginx, pointing to the backend API.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature-name`.
3.  Make your changes and commit them: `git commit -m 'Add some feature'`.
4.  Push to the branch: `git push origin feature/your-feature-name`.
5.  Open a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the [documentation](docs/) for detailed guides
- Review [API documentation](docs/api/) for endpoint details
