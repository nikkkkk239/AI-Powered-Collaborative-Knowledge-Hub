# AI-Powered Collaborative Knowledge Hub

A full-stack MERN application that enables teams to create, manage, and search knowledge documents with AI-powered features using Gemini API.

## Features

### Core Functionality
- **Authentication**: Email/password login with JWT tokens
- **Role-based Access**: User and Admin roles with different permissions
- **Document Management**: Create, read, update, and delete knowledge documents
- **Version Control**: Automatic versioning of document changes
- **Team Collaboration**: Shared knowledge base with activity tracking

### AI-Powered Features
- **Auto-Summarization**: Generate concise summaries using Gemini AI
- **Smart Tagging**: Automatically generate relevant tags for documents
- **Semantic Search**: Find documents using natural language queries
- **Q&A System**: Ask questions and get answers based on your knowledge base

### User Experience
- **Responsive Design**: Works seamlessly on all device sizes
- **Real-time Search**: Instant text and semantic search capabilities
- **Tag Filtering**: Filter documents by categories and topics
- **Activity Feed**: Track recent document updates and team activity

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Gemini AI API** for AI features
- **TypeScript** for type safety

### Frontend
- **React 18** with TypeScript
- **Zustand** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/knowledge-hub
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Getting Started

1. **Register**: Create a new account or login with existing credentials
2. **Add Gemini API Key**: Go to Profile Settings and add your Gemini API key to enable AI features
3. **Create Documents**: Start building your knowledge base by creating documents
4. **Use AI Features**: 
   - Auto-summarize documents
   - Generate intelligent tags
   - Perform semantic searches
   - Ask questions about your knowledge base

### API Key Management

Users must provide their own Gemini API key to use AI features:
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate a free API key
- Add it to your profile settings in the application
- Start using AI-powered features

### Permissions

- **Users**: Can create, edit, and delete their own documents
- **Admins**: Can manage all documents and user accounts
- **AI Features**: Available to any user with a configured Gemini API key

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get all documents (with search/filter)
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### AI Features
- `POST /api/ai/summarize` - Generate document summary
- `POST /api/ai/generate-tags` - Generate document tags
- `POST /api/ai/search` - Semantic search
- `POST /api/ai/qa` - Question & Answer

### User Management
- `PUT /api/users/profile` - Update user profile

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   └── main.tsx        # App entry point
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── app.ts          # Express app setup
│   └── package.json
└── README.md
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt for password security
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Comprehensive request validation
- **Role-based Authorization**: Granular permission control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details