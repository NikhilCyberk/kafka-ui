package constants

const (
	// BrokerService
	ErrDescribeCluster = "failed to describe cluster %s"
	ErrNoBrokersFound  = "no brokers found for cluster %s"
	BrokerIDKey        = "id"
	BrokerAddrKey      = "addr"

	// AuthHandler
	SecretKeyDev                  = "your-secret-key-change-in-production"
	DemoAdminHash                 = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
	MsgInvalidRequestData         = "Invalid request data: "
	MsgUsernameRequired           = "Username is required"
	MsgPasswordRequired           = "Password is required"
	MsgEmailRequired              = "Email is required"
	MsgUsernameExists             = "Username already exists"
	MsgFailedToHashPassword       = "Failed to hash password"
	MsgFailedToGenerateToken      = "Failed to generate token"
	MsgUserRegisteredSuccessfully = "User registered successfully"
	MsgInvalidCredentials         = "Invalid credentials"
	MsgLoginSuccessful            = "Login successful"
	MsgUserIDNotFoundInToken      = "User ID not found in token"
	MsgUsernameNotFoundInToken    = "Username not found in token"
	MsgUserNotFound               = "User not found"
	MsgProfileFetchedSuccessfully = "Profile fetched successfully"
	MsgCurrentPasswordRequired    = "Current password is required"
	MsgNewPasswordRequired        = "New password is required"
	MsgNewPasswordMinLength       = "New password must be at least 6 characters"

	// BrokerHandler
	MsgFailedToGetBrokers           = "Failed to get brokers: "
	MsgBrokersRetrievedSuccessfully = "Brokers retrieved successfully"

	// TopicHandler
	MsgFailedToGetTopics                 = "Failed to get topics: "
	MsgTopicsRetrievedSuccessfully       = "Topics retrieved successfully"
	MsgFailedToGetTopicDetails           = "Failed to get topic details: "
	MsgTopicDetailsRetrievedSuccessfully = "Topic details retrieved successfully"
	MsgInvalidRequest                    = "Invalid request: "
	MsgTopicNameRequired                 = "Topic name is required"
	MsgPartitionsGreaterThanZero         = "Partitions must be greater than 0"
	MsgReplicasGreaterThanZero           = "Replicas must be greater than 0"
	MsgFailedToCreateTopic               = "Failed to create topic: "
	MsgTopicCreatedSuccessfullyFmt       = "Topic %s created successfully"
	MsgCannotDeleteSystemTopic           = "Cannot delete system topic"
	MsgFailedToDeleteTopic               = "Failed to delete topic: "
	MsgTopicDeletedSuccessfullyFmt       = "Topic %s deleted successfully"

	// Middleware/Auth
	AuthHeaderPrefix = "Bearer "

	// Utils
	MsgAtLeastOneBrokerRequired = "At least one broker is required"
	MsgBrokerURLEmpty           = "Broker URL cannot be empty"
	MsgInvalidBrokerURLFormat   = "Invalid broker URL format. Expected host:port"
	TimestampFormat             = "2006-01-02 15:04:05"
	TruncateEllipsis            = "..."

	// Middleware.go (JWT, CORS, RateLimit, Logging)
	MsgInvalidToken                     = "Invalid token"
	MsgAuthorizationHeaderRequired      = "Authorization header required"
	MsgInvalidAuthorizationHeaderFormat = "Invalid authorization header format"
	HeaderAccessControlAllowOrigin      = "Access-Control-Allow-Origin"
	HeaderAccessControlAllowCredentials = "Access-Control-Allow-Credentials"
	HeaderAccessControlAllowHeaders     = "Access-Control-Allow-Headers"
	HeaderAccessControlAllowMethods     = "Access-Control-Allow-Methods"
	HeaderValueAllowOriginAll           = "*"
	HeaderValueAllowCredentialsTrue     = "true"
	HeaderValueAllowHeaders             = "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With"
	HeaderValueAllowMethods             = "POST, OPTIONS, GET, PUT, DELETE"
	MsgRateLimitExceeded                = "Rate limit exceeded"
)
