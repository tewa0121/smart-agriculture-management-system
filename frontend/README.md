# 🌱 Smart Agriculture Management System

A full-stack web application designed to digitize and simplify agricultural management. The **Smart Agriculture Management System** provides a centralized platform for managing farmers, farms, crops, agricultural activities, and related information.

The system is built using **React.js** for the frontend, **Node.js** for the backend, and **MySQL** for database management. **Postman** is used for testing and developing the backend REST APIs.

---

## 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Objectives](#-objectives)
* [Features](#-features)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Prerequisites](#-prerequisites)
* [Installation](#-installation)
* [Database Configuration](#-database-configuration)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [API Testing](#-api-testing)
* [Screenshots](#-screenshots)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

## 📖 About the Project

Agriculture is one of the most important sectors for food production and economic development. However, managing agricultural information manually can be difficult, time-consuming, and inefficient.

The **Smart Agriculture Management System** is designed to provide a digital solution for managing agricultural information in one centralized system.

The application allows users to manage agricultural data through a modern web interface and provides a backend REST API for communication between the frontend and database.

---

## 🎯 Objectives

The main objectives of this project are:

* 🌱 Digitize agricultural management processes.
* 👨‍🌾 Manage farmer information efficiently.
* 🚜 Manage farms and agricultural activities.
* 🌾 Manage crop information and production activities.
* 💧 Support efficient agricultural resource management.
* 📊 Provide organized agricultural information and reports.
* 🔐 Provide secure user authentication and authorization.
* 🔄 Provide RESTful APIs for communication between frontend and backend.
* 🗄️ Store agricultural information in a structured MySQL database.
* 📈 Create a foundation for future smart agriculture technologies.

---

## 🚀 Features

### 🔐 User Authentication

* User registration and login.
* Secure authentication.
* User authorization.
* Role-based access control.

### 👨‍🌾 Farmer Management

* Add farmers.
* View farmer information.
* Update farmer information.
* Delete farmer records.
* Manage farmer profiles.

### 🚜 Farm Management

* Add farm information.
* View registered farms.
* Update farm details.
* Manage farm-related information.

### 🌾 Crop Management

* Add crops.
* View crop information.
* Update crop details.
* Delete crop records.
* Manage crop-related activities.

### 💧 Agricultural Resource Management

* Manage agricultural resources.
* Track resource usage.
* Support efficient utilization of farming resources.

### 📊 Dashboard

The system provides a dashboard for displaying important agricultural information and statistics.

Examples include:

* Total farmers
* Total farms
* Total crops
* Agricultural activities
* Resource information
* System statistics

### 🔌 REST API

The Node.js backend provides RESTful APIs for:

* Authentication
* Farmer management
* Farm management
* Crop management
* Agricultural data management
* User management

### 🧪 API Testing

**Postman** is used to test and verify backend API endpoints.

---

## 🛠️ Technology Stack

### Frontend

* ⚛️ **React.js**
* HTML5
* CSS3
* JavaScript
* Axios / Fetch API

### Backend

* 🟢 **Node.js**
* Express.js
* RESTful API
* JavaScript

### Database

* 🐬 **MySQL**

### API Development & Testing

* 📮 **Postman**

### Development Tools

* Git
* GitHub
* Visual Studio Code
* npm

---

## 🏗️ System Architecture

The application follows a three-layer architecture:

```text
┌──────────────────────────────┐
│          Frontend            │
│          React.js            │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│           Backend            │
│       Node.js / Express      │
└──────────────┬───────────────┘
               │
               │ SQL Queries
               ▼
┌──────────────────────────────┐
│           Database           │
│            MySQL             │
└──────────────────────────────┘
```

### Data Flow

```text
User
  │
  ▼
React Frontend
  │
  │ HTTP Request
  ▼
Node.js / Express API
  │
  │ SQL Query
  ▼
MySQL Database
  │
  │ Response
  ▼
Node.js API
  │
  │ JSON Response
  ▼
React Frontend
  │
  ▼
User
```

---

## 📂 Project Structure

A typical project structure is:

```text
smart-agriculture-management-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── database/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── screenshots/
│
├── .gitignore
├── README.md
└── ...
```

> The structure above is an example. Adjust it to match your actual project folders.

---

# ⚙️ Prerequisites

Before running the project, make sure the following software is installed:

* **Node.js**
* **npm**
* **MySQL**
* **Git**
* **Postman** (optional, for API testing)
* A code editor such as **Visual Studio Code**

You can verify Node.js and npm installation:

```bash
node --version
```

```bash
npm --version
```

---

# 📥 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-agriculture-management-system.git
```

Navigate into the project:

```bash
cd smart-agriculture-management-system
```

---

## 2. Install Backend Dependencies

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## 3. Install Frontend Dependencies

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# 🗄️ Database Configuration

Make sure MySQL is installed and running.

Create a database:

```sql
CREATE DATABASE smart_agriculture;
```

Then select the database:

```sql
USE smart_agriculture;
```

If your project contains an SQL file, import it into the database.

For example:

```bash
mysql -u root -p smart_agriculture < database.sql
```

> Replace `database.sql` with the actual name of your SQL file.

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_agriculture
DB_PORT=3306

JWT_SECRET=your_secret_key
```

**Important:** Never upload your `.env` file to GitHub.

Add it to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# ▶️ Running the Application

## Start the Backend

Navigate to the backend:

```bash
cd backend
```

Run the server:

```bash
npm start
```

Or, if your project uses Nodemon:

```bash
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

---

## Start the Frontend

Open another terminal:

```bash
cd frontend
```

Run:

```bash
npm start
```

If you are using Vite:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🧪 API Testing with Postman

Postman can be used to test the Node.js REST API independently from the React frontend.

Example API endpoints:

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| POST   | `/api/auth/register` | Register a user |
| POST   | `/api/auth/login`    | Login           |
| GET    | `/api/farmers`       | Get all farmers |
| POST   | `/api/farmers`       | Add a farmer    |
| GET    | `/api/farmers/:id`   | Get a farmer    |
| PUT    | `/api/farmers/:id`   | Update a farmer |
| DELETE | `/api/farmers/:id`   | Delete a farmer |
| GET    | `/api/farms`         | Get all farms   |
| POST   | `/api/farms`         | Add a farm      |
| GET    | `/api/crops`         | Get all crops   |
| POST   | `/api/crops`         | Add a crop      |

> Update these endpoints according to the actual routes implemented in your project.

### Example Request

```http
POST http://localhost:5000/api/farmers
```

Example JSON body:

```json
{
  "name": "John Doe",
  "phone": "0912345678",
  "location": "Amhara",
  "farmSize": 5
}
```

---

# 📸 Screenshots

Add screenshots of your application here.

For example:

### Dashboard

```markdown
![Dashboard](screenshots/dashboard.png)
```

### Farmer Management

```markdown
![Farmer Management](screenshots/farmers.png)
```

### Crop Management

```markdown
![Crop Management](screenshots/crops.png)
```

### Login

```markdown
![Login](screenshots/login.png)
```

---

# 🔮 Future Improvements

The system can be extended with advanced smart agriculture technologies, including:

* 🤖 AI-based crop disease detection.
* 📡 IoT sensor integration.
* 💧 Automated smart irrigation.
* 🌦️ Real-time weather API integration.
* 🌾 Crop yield prediction.
* 🛰️ Satellite-based farm monitoring.
* 📱 Mobile application.
* 🔔 Real-time agricultural alerts.
* 📈 Advanced agricultural analytics.
* 🧠 Machine-learning-based crop recommendations.
* 🗺️ GIS-based farm mapping.
* 🌱 Soil moisture and soil-quality monitoring.
* ☁️ Cloud deployment.

---

# 🔒 Security

The application should follow security best practices, including:

* Never commit passwords or API keys.
* Keep `.env` files out of Git.
* Validate user input.
* Use authentication and authorization.
* Hash user passwords before storing them.
* Use parameterized SQL queries to prevent SQL injection.
* Configure CORS appropriately.
* Validate API requests.

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/smart-agriculture-management-system.git
```

### 3. Create a feature branch

```bash
git checkout -b feature/new-feature
```

### 4. Make your changes

### 5. Commit your changes

```bash
git add .
git commit -m "Add new feature"
```

### 6. Push your branch

```bash
git push origin feature/new-feature
```

### 7. Create a Pull Request

---

# 📄 License

This project is developed for educational and development purposes.

You may add an open-source license such as the **MIT License** if you intend to make the project open source.

---

# 👨‍💻 Author

**Smart Agriculture Management System**

A full-stack agricultural management solution built with:

* ⚛️ React.js
* 🟢 Node.js
* 🚀 Express.js
* 🐬 MySQL
* 📮 Postman

---

# ⭐ Support

If you find this project useful, please consider giving the repository a ⭐ on GitHub.

---

## 🌱 Smart Agriculture Management System

**Building smarter agriculture through modern web technology.**
