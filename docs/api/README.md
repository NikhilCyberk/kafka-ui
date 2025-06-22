# Kafka UI API Reference

This document provides a comprehensive reference for the Kafka UI REST API, which is used by the frontend to manage and monitor Kafka clusters.

## Base URL

All API endpoints are prefixed with `/api`.

```
http://localhost:8080/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. All endpoints are protected except for the `/auth/login` and `/auth/register` endpoints.

To authenticate, you must first obtain a token by sending a `POST` request to `/api/auth/login`. You must then include this token in the `Authorization` header for all subsequent requests.

**Header Format:** `Authorization: Bearer <your-jwt-token>`

## Response Format

All API responses follow a standard format.

**Successful Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "type": "ERROR_TYPE",
    "message": "A detailed error message",
    "code": 404
  }
}
```

## Endpoints

---

### 🔑 Authentication

| Method | Endpoint                    | Description                       |
|--------|-----------------------------|-----------------------------------|
| `POST` | `/auth/register`            | Register a new user.              |
| `POST` | `/auth/login`               | Log in and receive a JWT.         |
| `GET`  | `/auth/profile`             | Get the current user's profile.   |
| `PUT`  | `/auth/change-password`     | Change the current user's password. |

---

### ☸️ Clusters

| Method   | Endpoint                      | Description                  |
|----------|-------------------------------|------------------------------|
| `GET`    | `/clusters`                   | List all configured clusters.  |
| `POST`   | `/clusters`                   | Add a new cluster configuration. |
| `DELETE` | `/clusters/:clusterName`      | Remove a cluster configuration.|

---

### 📜 Topics

| Method   | Endpoint                                   | Description               |
|----------|--------------------------------------------|---------------------------|
| `GET`    | `/clusters/:clusterName/topics`            | List all topics.          |
| `POST`   | `/clusters/:clusterName/topics`            | Create a new topic.       |
| `GET`    | `/clusters/:clusterName/topics/:topicName` | Get detailed topic info.  |
| `DELETE` | `/clusters/:clusterName/topics/:topicName` | Delete a topic.           |

---

### 🖥️ Brokers

| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| `GET`  | `/clusters/:clusterName/brokers`| List all brokers.       |

---

### 👥 Consumer Groups

| Method   | Endpoint                                        | Description                  |
|----------|-------------------------------------------------|------------------------------|
| `GET`    | `/clusters/:clusterName/consumer-groups`        | List all consumer groups.    |
| `GET`    | `/clusters/:clusterName/consumer-groups/:groupId` | Get detailed group info.     |

---

### ✉️ Messages

| Method | Endpoint                                             | Description               |
|--------|------------------------------------------------------|---------------------------|
| `GET`  | `/clusters/:clusterName/topics/:topicName/messages`  | Get messages from a topic.|
| `POST` | `/clusters/:clusterName/topics/:topicName/messages`  | Produce a new message.    |

---

### 📊 Metrics

| Method | Endpoint                                            | Description                          |
|--------|-----------------------------------------------------|--------------------------------------|
| `GET`  | `/clusters/:clusterName/metrics/cluster-health`     | Get overall cluster health metrics.  |
| `GET`  | `/clusters/:clusterName/metrics/consumer-lag`       | Get consumer lag for all groups.     |
| `GET`  | `/clusters/:clusterName/metrics/brokers`            | Get metrics for all brokers.         |
| `GET`  | `/clusters/:clusterName/metrics/topics`             | Get metrics for all topics.          |
| `GET`  | `/clusters/:clusterName/metrics/consumer-groups`    | Get detailed metrics for all groups. |

## Error Codes

| Code | Description |
|------|-------------|
| `CLUSTER_NOT_FOUND` | Specified cluster does not exist |
| `TOPIC_NOT_FOUND` | Specified topic does not exist |
| `CONSUMER_GROUP_NOT_FOUND` | Specified consumer group does not exist |
| `INVALID_REQUEST` | Request body is invalid |
| `KAFKA_ERROR` | Error communicating with Kafka |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

The API supports CORS for cross-origin requests from the frontend application.

## Examples

### Using curl

```bash
# List clusters
curl http://localhost:8080/api/clusters

# Add a cluster
curl -X POST http://localhost:8080/api/clusters \
  -H "Content-Type: application/json" \
  -d '{"name":"test","bootstrapServers":"localhost:9092"}'

# Get topics
curl http://localhost:8080/api/clusters/test/topics
```

### Using JavaScript

```javascript
// List clusters
const response = await fetch('http://localhost:8080/api/clusters');
const clusters = await response.json();

// Add a cluster
const newCluster = await fetch('http://localhost:8080/api/clusters', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'test',
    bootstrapServers: 'localhost:9092'
  })
});
``` 