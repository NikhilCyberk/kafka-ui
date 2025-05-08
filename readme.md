# Kafka UI

A modern web interface for managing Apache Kafka clusters, built with Go and React.

## Features

- View and manage Kafka topics
- Produce and consume messages
- Monitor consumer groups
- Real-time updates
- Modern, responsive UI

## Prerequisites

- Go 1.20 or later
- Node.js 16 or later
- Apache Kafka cluster

## Project Structure

```
kafka-ui/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   └── internal/
│       ├── api/
│       │   └── handlers/
│       └── kafka/
│           └── client.go
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nikhilgoenkatech/kafka-ui.git
   cd kafka-ui
   ```

2. Set up the backend:
   ```bash
   cd kafka-ui
   cp .env.example .env  # Edit with your Kafka configuration
   go mod download
   go run cmd/server/main.go
   ```

3. Set up the frontend:
   ```bash
   cd kafka-ui-frontend
   npm install
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

Backend:
- `KAFKA_BROKERS`: Comma-separated list of Kafka brokers (default: "localhost:9092")
- `PORT`: Server port (default: 8080)

## Development

### Backend

The backend is built with:
- Gin web framework
- Segmentio Kafka Go client
- CORS support
- Environment configuration

### Frontend

The frontend is built with:
- React 18
- Chakra UI
- React Router
- Axios for API calls

## API Endpoints

### Topics
- `GET /api/topics` - List all topics
- `GET /api/topics/:name` - Get topic details
- `POST /api/topics` - Create a new topic
- `DELETE /api/topics/:name` - Delete a topic

### Messages
- `GET /api/messages/:topic` - Get messages from a topic
- `POST /api/messages/:topic` - Produce a message to a topic

### Consumer Groups
- `GET /api/consumer-groups` - List all consumer groups
- `GET /api/consumer-groups/:groupId` - Get consumer group details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
