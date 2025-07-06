# Audience API Documentation

This API allows users to manage audience data, segments, and personas for marketing and business analysis purposes.

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [Audience Management Routes](#audience-management-routes)
- [Segment Management Routes](#segment-management-routes)
- [Persona Management Routes](#persona-management-routes)
- [AI Model Generation Routes](#ai-model-generation-routes)
- [Admin Configuration Routes](#admin-configuration-routes)
- [Background Processing](#background-processing)
- [Client Caching](#client-caching)
- [Running Celery Beat for Scheduled Tasks](#running-celery-beat-for-scheduled-tasks)
- [Server-Sent Events (SSE)](#server-sent-events-sse)

## Getting Started

1. Clone this repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up Redis for Celery: 
   - Install Redis: https://redis.io/download
   - Start Redis server: `redis-server`
4. Start Celery worker:
   - `celery -A main.celery worker --loglevel=info`
5. Run the server: `python main.py`
6. The API will be available at: `http://localhost:5000`

## Authentication Routes

### Register a New User

```
POST /signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user_id": 1
}
```

### User Login

```
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user_id": 1
}
```

### User Logout

```
GET /logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Audience Management Routes

### Get All Audiences

```
GET /audience
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Target Audience 1",
    "website": "example.com",
    "business_description": "Description here",
    "industry": "Technology",
    "customers": "Businesses",
    "location": "North America",
    "age_range": "25-45",
    "income_level": "Middle to high",
    "core_need": "Efficiency",
    "additional_info": "Additional info here",
    "updated_at": "2023-05-10T15:30:45.123456",
    "created_at": "2023-05-10T15:30:45.123456"
  }
]
```

### Get One Audience

```
GET /audience/<audience_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Target Audience 1",
  "website": "example.com",
  "business_description": "Description here",
  "industry": "Technology",
  "customers": "Businesses",
  "location": "North America",
  "age_range": "25-45",
  "income_level": "Middle to high",
  "core_need": "Efficiency",
  "additional_info": "Additional info here",
  "claude_response": "<audience>...</audience>",
  "openai_response": null,
  "deepseek_response": null,
  "perplexity_response": null,
  "groq_response": null,
  "created_at": "2023-05-10T15:30:45.123456",
  "updated_at": "2023-05-10T15:30:45.123456"
}
```

### Create a New Audience

```
POST /audience
```

**Request Body:**
```json
{
  "name": "Target Audience 1",
  "website": "example.com",
  "business_description": "Description here",
  "industry": "Technology",
  "customers": "Businesses",
  "location": "North America",
  "age_range": "25-45",
  "income_level": "Middle to high",
  "core_need": "Efficiency",
  "additional_info": "Additional info here"
}
```

**Response:**
```json
{
  "message": "Audience created successfully",
  "audience_id": 1
}
```

### Update an Audience

```
PUT /audience/<audience_id>
```

**Request Body:**
```json
{
  "name": "Updated Target Audience",
  "website": "example.com",
  "business_description": "Updated description",
  "industry": "Technology",
  "customers": "Businesses",
  "location": "North America",
  "age_range": "25-45",
  "income_level": "Middle to high",
  "core_need": "Efficiency",
  "additional_info": "Updated additional info"
}
```

**Response:**
```json
{
  "message": "Audience updated successfully"
}
```

### Delete an Audience

```
DELETE /audience/<audience_id>
```

**Response:**
```json
{
  "message": "Audience deleted successfully"
}
```

## Segment Management Routes

### Get All Segments for an Audience

```
GET /audience/<audience_id>/segments
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Segment 1",
    "description": "Description of segment 1",
    "created_at": "2023-05-10T15:30:45.123456",
    "updated_at": "2023-05-10T15:30:45.123456"
  }
]
```

### Create a New Segment

```
POST /audience/<audience_id>/segments
```

**Request Body:**
```json
{
  "name": "Segment 1",
  "description": "Description of segment 1"
}
```

**Response:**
```json
{
  "message": "Segment created successfully",
  "segment_id": 1
}
```

### Get One Segment

```
GET /segments/<segment_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Segment 1",
  "description": "Description of segment 1",
  "audience_id": 1,
  "created_at": "2023-05-10T15:30:45.123456",
  "updated_at": "2023-05-10T15:30:45.123456"
}
```

### Update a Segment

```
PUT /segments/<segment_id>
```

**Request Body:**
```json
{
  "name": "Updated Segment 1",
  "description": "Updated description of segment 1"
}
```

**Response:**
```json
{
  "message": "Segment updated successfully"
}
```

### Delete a Segment

```
DELETE /segments/<segment_id>
```

**Response:**
```json
{
  "message": "Segment deleted successfully"
}
```

## Persona Management Routes

### Get All Personas for a Segment

```
GET /segments/<segment_id>/personas
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Persona 1",
    "data": {
      "age": 35,
      "gender": "Female",
      "occupation": "Marketing Manager",
      "interests": ["technology", "travel", "fitness"],
      "pain_points": ["lack of time", "need for automation"]
    },
    "created_at": "2023-05-10T15:30:45.123456",
    "updated_at": "2023-05-10T15:30:45.123456"
  }
]
```

### Create a New Persona

```
POST /segments/<segment_id>/personas
```

**Request Body:**
```json
{
  "name": "Persona 1",
  "data": {
    "age": 35,
    "gender": "Female",
    "occupation": "Marketing Manager",
    "interests": ["technology", "travel", "fitness"],
    "pain_points": ["lack of time", "need for automation"]
  }
}
```

**Response:**
```json
{
  "message": "Persona created successfully",
  "persona_id": 1
}
```

### Get One Persona

```
GET /personas/<persona_id>
```

**Response:**
```json
{
  "id": 1,
  "name": "Persona 1",
  "segment_id": 1,
  "data": {
    "age": 35,
    "gender": "Female",
    "occupation": "Marketing Manager",
    "interests": ["technology", "travel", "fitness"],
    "pain_points": ["lack of time", "need for automation"]
  },
  "created_at": "2023-05-10T15:30:45.123456",
  "updated_at": "2023-05-10T15:30:45.123456"
}
```

### Update a Persona

```
PUT /personas/<persona_id>
```

**Request Body:**
```json
{
  "name": "Updated Persona 1",
  "data": {
    "age": 36,
    "income": "$85,000",
    "new_field": "This will be added to existing data"
  }
}
```

**Response:**
```json
{
  "message": "Persona updated successfully"
}
```

### Delete a Persona

```
DELETE /personas/<persona_id>
```

**Response:**
```json
{
  "message": "Persona deleted successfully"
}
```

## AI Model Generation Routes

### Generate Audience Responses using AI

```
POST /audience/<audience_id>/generate
```

**Request Body:**
```json
{
  "prompt_type": "perplexity"  // Options: perplexity, expert_reflection, simulation, optimization
}
```

**Response:**
```json
{
  "message": "Audience response generated successfully using claude",
  "response": "<audience>Sample Claude API response</audience>",
  "prompt_used": "Analyze the following audience data and provide insights:",
  "deep_research": false
}
```

## Admin Configuration Routes

### Create Initial Admin User

```
POST /setup-admin
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "secureadminpassword"
}
```

**Response:**
```json
{
  "message": "Admin user admin@example.com created successfully"
}
```

### Get Current Prompt Configurations

```
GET /admin/prompts
```

**Response:**
```json
{
  "perplexity_prompt": "Analyze the following audience data and provide insights:",
  "expert_reflection_prompt": "As an expert marketer, reflect on this audience data:",
  "run_simulation_prompt": "Simulate how this audience would interact with the product:",
  "run_optimization_simulation_prompt": "Optimize marketing approach for this audience:",
  "create_persona_prompt": "Create a detailed persona based on this segment data:",
  "chat_with_persona_prompt": "You are simulating a conversation with the following persona:",
  "image_processing_prompt": "Generate a visual representation of this audience:",
  "deep_research": false
}
```

### Update Prompt Configurations

```
PUT /admin/prompts
```

**Request Body:**
```json
{
  "perplexity_prompt": "New perplexity prompt text...",
  "expert_reflection_prompt": "New expert reflection prompt text...",
  "deep_research": true
}
```

**Response:**
```json
{
  "message": "Prompt configurations updated successfully"
}
```

### Make a User an Admin

```
POST /admin/users/<user_id>/make-admin
```

**Response:**
```json
{
  "message": "User user@example.com is now an admin"
}
```

### Revoke Admin Privileges

```
POST /admin/users/<user_id>/revoke-admin
```

**Response:**
```json
{
  "message": "Admin privileges revoked from user user@example.com"
}
```

## Background Processing

The application uses Celery for background tasks. When a new audience is created, the system automatically:

1. Sends the audience data to Perplexity for research
2. Uses the configured AI model to analyze the data and generate insights
3. Creates segments and personas based on the AI analysis
4. Stores all results in the database

This processing happens asynchronously, so the API can respond immediately to user requests while complex analysis happens in the background.

## Client Caching

The application uses a singleton pattern to cache AI API clients (OpenAI, Anthropic Claude, DeepSeek, and Groq). This ensures that:

1. Clients are initialized only once per Celery worker process
2. API connections are reused across tasks
3. If a client becomes unavailable, the system attempts to reinitialize it

A scheduled task runs every 30 minutes to check the status of all clients and reinitialize any that have become unavailable.

## Running Celery Beat for Scheduled Tasks

To run scheduled tasks like client status checks:

```bash
celery -A main.celery beat --loglevel=info
```

This should be run alongside your Celery worker.

## Server-Sent Events (SSE)

The application uses Flask-SSE to provide real-time updates to connected clients. These events are particularly useful for tracking the status of background tasks like audience processing.

### Event Streams:

```
GET /stream
```
- Main SSE endpoint provided by Flask-SSE
- Query parameters:
  - `channel`: The channel to subscribe to (e.g., `audience` or `user.1`)

### Available Channels:

1. `audience`: General channel for all audience-related events
2. `user.<id>`: User-specific channel (e.g., `user.1` for user with ID 1)

### Events Types:

1. `audience_processing_started`: When audience processing begins
   - Contains: audience_id, user_id, audience_name

2. `audience_processing_complete`: When audience processing successfully completes 
   - Contains: audience_id, segments_count, user_id, audience_name

3. `audience_processing_error`: When an error occurs during audience processing
   - Contains: audience_id, error, user_id

### Frontend Integration Example:

```javascript
// Subscribe to general audience events
const audienceEvents = new EventSource('/stream?channel=audience');

// Subscribe to user-specific events
const userEvents = new EventSource('/stream?channel=user.1');

// Handle processing completion events
audienceEvents.addEventListener('audience_processing_complete', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Processing complete for audience: ${data.audience_name}`);
  // Update UI accordingly
});

// Handle error events
audienceEvents.addEventListener('audience_processing_error', (e) => {
  const data = JSON.parse(e.data);
  console.error(`Processing error for audience: ${data.audience_id}`);
  // Show error message
});

// Close connection when navigating away
window.addEventListener('beforeunload', () => {
  audienceEvents.close();
  userEvents.close();
});
```

## Environment Variables

Create a `.env` file with the following variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GROQ_API_KEY=your_groq_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Data Model

### User
- id: Integer (Primary Key)
- email: String (Unique)
- password_hash: String
- is_admin: Boolean
- audience: Relationship to Audience

### Audience
- id: Integer (Primary Key)
- name: String
- user_id: Integer (Foreign Key to User)
- website: String
- business_description: Text
- industry: String
- customers: Text
- location: String
- age_range: String
- income_level: String
- core_need: Text
- additional_info: Text
- created_at: DateTime
- updated_at: DateTime
- segments: Relationship to Segment

### Segment
- id: Integer (Primary Key)
- name: String
- description: Text
- audience_id: Integer (Foreign Key to Audience)
- created_at: DateTime
- updated_at: DateTime
- personas: Relationship to Persona

### Persona
- id: Integer (Primary Key)
- name: String
- segment_id: Integer (Foreign Key to Segment)
- data: Text (JSON storage for flexible fields)
- created_at: DateTime
- updated_at: DateTime

## Structured Data Format

The application uses Pydantic models to define and validate the structure of AI-generated data. 
This ensures consistent data formatting across different AI models and simplifies parsing and storage.

### Audience Insight Schema

```json
{
  "summary": "Overall audience summary",
  "total_addressable_market": "Estimate of total addressable market",
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "segments": [
    {
      "name": "Segment 1 Name",
      "description": "Detailed description of this segment",
      "size_percentage": 40,
      "key_characteristics": ["Characteristic 1", "Characteristic 2"],
      "marketing_approach": "Suggested marketing approach for this segment",
      "personas": [
        {
          "name": "Persona Name",
          "age": 35,
          "gender": "Female",
          "occupation": "Marketing Manager",
          "income": "$85,000",
          "education": "Bachelor's Degree",
          "location": "Urban area",
          "interests": ["Interest 1", "Interest 2"],
          "goals": ["Goal 1", "Goal 2"],
          "pain_points": ["Pain point 1", "Pain point 2"],
          "behaviors": ["Behavior 1", "Behavior 2"],
          "values": ["Value 1", "Value 2"],
          "preferred_channels": ["Channel 1", "Channel 2"],
          "purchasing_habits": ["Habit 1", "Habit 2"]
        }
      ]
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
```

This schema is enforced using Pydantic models defined in `schema.py`. When modifying the expected data structure, 
update the schema definitions in this file.

## Notes

- All routes except for `/signup`, `/login`, and `/` require authentication
- The persona data field uses JSON storage to allow for flexible fields without modifying the database schema
- New fields can be added to persona data at any time

# Audience Insight Backend

This backend provides a comprehensive API for managing audience insights, segments, personas, and interactive simulations.

## Setup & Installation

1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your API keys for OpenAI, Anthropic Claude, Groq, etc.

4. Run the application:
```bash
flask run
```

5. Run Celery worker (for background tasks):
```bash
celery -A celery_worker.celery worker --loglevel=info
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/signup` | Register a new user | `{"email": "user@example.com", "password": "secure_pwd"}` | `201: {"message": "User created"}` |
| `POST` | `/login` | Login with existing user | `{"email": "user@example.com", "password": "secure_pwd"}` | `200: {"message": "Login successful"}` |
| `GET` | `/logout` | Logout current user | None | `200: {"message": "Logout successful"}` |

### Audience Management

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/audience` | Get all audiences | None | `200: [{"id": 1, "name": "Example Audience", ...}]` |
| `GET` | `/audience/:id` | Get one audience | None | `200: {"id": 1, "name": "Example Audience", ...}` |
| `POST` | `/audience` | Create audience | *See audience schema* | `201: {"message": "Created", "audience_id": 1}` |
| `PUT` | `/audience/:id` | Update audience | *See audience schema* | `200: {"message": "Updated"}` |
| `DELETE` | `/audience/:id` | Delete audience | None | `200: {"message": "Deleted"}` |
| `POST` | `/audience/:id/generate` | Generate insights | `{"prompt_type": "expert_reflection"}` | `200: {"message": "Generation started"}` |

### Segment Management

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/audience/:id/segments` | Get segments for audience | None | `200: [{"id": 1, "name": "Segment 1", ...}]` |
| `POST` | `/audience/:id/segments` | Create segment | `{"name": "New Segment", "description": "..."}` | `201: {"message": "Created", "segment_id": 1}` |
| `GET` | `/segments/:id` | Get one segment | None | `200: {"id": 1, "name": "Segment 1", ...}` |
| `PUT` | `/segments/:id` | Update segment | `{"name": "Updated", ...}` | `200: {"message": "Updated"}` |
| `DELETE` | `/segments/:id` | Delete segment | None | `200: {"message": "Deleted"}` |

### Persona Management

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/segments/:id/personas` | Get personas for segment | None | `200: [{"id": 1, "name": "Persona 1", ...}]` |
| `POST` | `/segments/:id/personas` | Create persona | `{"name": "New Persona", "data": {...}}` | `201: {"message": "Created", "persona_id": 1}` |
| `GET` | `/personas/:id` | Get one persona | None | `200: {"id": 1, "name": "Persona 1", ...}` |
| `PUT` | `/personas/:id` | Update persona | `{"name": "Updated", ...}` | `200: {"message": "Updated"}` |
| `DELETE` | `/personas/:id` | Delete persona | None | `200: {"message": "Deleted"}` |

### Simulation Management (NEW)

These endpoints allow interactive engagement with audience segments and personas through simulations and chat.

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/simulations` | Create simulation | `{"audience_id": 1, "name": "Test Simulation", "segment_ids": [1,2], "persona_ids": [1,2,3], "type": "default"}` | `201: {"message": "Simulation created", "simulation": {...}}` |
| `GET` | `/simulations` | List simulations | Query: `audience_id=1` (optional) | `200: [{"id": 1, "name": "Simulation 1", ...}]` |
| `GET` | `/simulations/:id` | Get one simulation | None | `200: {"id": 1, "name": "Simulation 1", ...}` |
| `DELETE` | `/simulations/:id` | Delete simulation | None | `200: {"message": "Simulation deleted"}` |

### Chat with Personas (NEW)

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/chat/simulation/:sim_id/persona/:persona_id` | Chat with persona | `{"message": "Hello, how are you?"}` | `200: {"response": "I'm doing well...", "chat_history": [...]}` |
| `GET` | `/chat/:chat_history_id` | Get chat history | None | `200: {"id": 1, "messages": [...]}` |
| `GET` | `/simulations/:id/chats` | List chats for simulation | None | `200: [{"id": 1, "persona_id": 2, "message_count": 10, ...}]` |

### Admin Routes

| Method | Endpoint | Description | Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/admin/prompts` | Get prompt configs | None | `200: {"perplexity_prompt": "...", ...}` |
| `PUT` | `/admin/prompts` | Update prompt configs | `{"perplexity_prompt": "New prompt"}` | `200: {"message": "Updated"}` |
| `POST` | `/admin/users/:id/make-admin` | Make user admin | None | `200: {"message": "User is now admin"}` |

### Server-Sent Events (SSE)

| Endpoint | Description | Channel |
|----------|-------------|---------|
| `/stream?channel=audience` | General audience events | `audience` |
| `/stream?channel=user.1` | User-specific events | `user.<id>` |

## Data Models

### Audience Data Structure

```json
{
  "name": "Target Audience",
  "website": "example.com",
  "business_description": "E-commerce platform selling organic products",
  "industry": "Retail",
  "customers": "Health-conscious consumers",
  "location": "United States",
  "age_range": "25-45",
  "income_level": "Middle to high",
  "core_need": "Health and sustainability",
  "additional_info": "Focus on eco-friendly packaging"
}
```

### Segment Data Structure

```json
{
  "name": "Young Professionals",
  "description": "Urban professionals aged 25-35 with high disposable income"
}
```

### Persona Data Structure

```json
{
  "name": "Sarah Miller",
  "data": {
    "age": 32,
    "gender": "Female",
    "occupation": "Marketing Director",
    "income": "$95,000",
    "education": "Master's Degree",
    "location": "Urban area",
    "interests": ["Yoga", "Organic food", "Travel"],
    "goals": ["Career advancement", "Healthy lifestyle"],
    "pain_points": ["Lack of time", "Environmental concerns"]
  }
}
```

### Simulation Data Structure (NEW)

```json
{
  "name": "Customer Journey Simulation",
  "description": "Simulating how different segments interact with our product",
  "audience_id": 1,
  "segment_ids": [1, 2],
  "persona_ids": [1, 2, 3],
  "type": "default"  // Can be "default" or "optimization"
}
```

### Chat Message Structure (NEW)

```json
{
  "role": "user",  // or "persona"
  "content": "Hello, what are your biggest challenges when shopping for organic products?",
  "timestamp": "2023-06-15T12:34:56.789Z"
}
```

## Frontend Implementation Guidelines (NEW)

### Simulation Dashboard

1. Create a simulation dashboard that lists all simulations for the current user
2. Allow filtering simulations by audience
3. Each simulation card should show:
   - Name
   - Description
   - Number of segments/personas
   - Creation date
   - Edit/Delete actions

### Create Simulation Flow

1. Select an audience
2. Optional: Select specific segments/personas (otherwise all are included)
3. Choose simulation type (default or optimization)
4. Generate simulation
5. Display the AI-generated simulation results in a well-formatted UI

### Persona Chat Interface

1. From a simulation detail view, show all available personas
2. Allow users to select a persona to chat with
3. Implement a chat interface similar to ChatGPT/Claude
4. Display chat history
5. Use appropriate UI to show the persona is "typing" during API calls
6. Allow users to start new chats or continue existing ones

### Real-time Updates with SSE

1. Connect to the SSE endpoint using EventSource API
2. Listen for events related to audience processing:
   - `audience_processing_started`
   - `audience_processing_complete`
   - `audience_processing_error`
3. Update UI in real-time based on these events

## Development Guidelines

### Adding New AI Models

1. Update the `clients.py` file to add the new client
2. Update the `utils.py` file with a new call function
3. Add the model to the configuration in `config.py`

### Creating Custom Simulations

Modify the prompt templates in `prompts.py` to create new types of simulations.

### SQLAlchemy 2.0 Migration

The application has been updated to use SQLAlchemy 2.0. Ensure that:
- `Session.get()` is used instead of `Query.get()` for retrieving records by primary key.
- Refer to the [SQLAlchemy 2.0 migration guide](https://sqlalche.me/e/b8d9) for more details.

