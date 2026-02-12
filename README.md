# 🚗 CarConnect - Car Rental Application

CarConnect is a modern, full-stack car rental platform connecting car owners with travelers. Built with the latest web technologies, it offers a seamless experience for browsing, booking, and hosting vehicles.

## 🌟 Key Features

*   **User Authentication**: Secure Login and Registration system using JWT.
*   **Search & Browse**: Find cars by location and district with an intuitive search interface.
*   **Booking System**: Easy-to-use booking interface with date selection.
*   **Host Your Car**: Car owners can list their vehicles, upload photos, and manage availability.
*   **Dashboard**:
    *   **My Bookings**: View status and details of your rented trips.
    *   **Hosted Bookings**: Manage incoming requests for your listed cars.
*   **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
*   **Real-time Availability**: Check car status and availability instantly.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework**: Angular v20
*   **Styling**: CSS3, Bootstrap 5
*   **Icons**: FontAwesome
*   **State Management**: Angular Signals, RxJS
*   **Language**: TypeScript ~5.9

### Backend (Server)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JSON Web Token (JWT) & Bcrypt
*   **File Handling**: Multer (for car image uploads)

## 📸 Screenshots

Explore the application visuals here: [View Screenshots](https://github.com/Akhilesh-github-7/Car_Rental_Application/tree/dev/web%20screenshots)

> *Note: Please visit the link above to see the latest interface designs including Home, Search, Booking, and Dashboard views.*

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
*   Node.js (v18+ recommended)
*   npm (Node Package Manager)
*   MongoDB (Local or Atlas URI)
*   Angular CLI (`npm install -g @angular/cli`)

### 1. Clone the Repository
```bash
git clone https://github.com/Akhilesh-github-7/Car_Rental_Application.git
cd Car_Rental_Application
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd CarConnect-server
npm install
```

**Configuration:**
Create a `.env` file in the `CarConnect-server` directory with the following variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Start the Server:**
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd CarConnect
npm install
```

**Start the Application:**
```bash
ng serve
```
Navigate to `http://localhost:4200/` in your browser. The app will automatically reload if you change any of the source files.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | Register a new user |
| | `/api/auth/login` | Login user & get token |
| **Cars** | `/api/cars` | Get all available cars |
| | `/api/cars/:id` | Get specific car details |
| | `/api/new-cars` | Host (upload) a new car |
| **Bookings** | `/api/bookings` | Create a new booking |
| | `/api/bookings/my-bookings` | Get logged-in user's bookings |
| | `/api/bookings/hosted` | Get bookings for user's cars |
| **Locations**| `/api/locations` | Get available rental locations |

## 📄 License
This project is licensed under the ISC License.
