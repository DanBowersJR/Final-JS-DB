# Voting App

## Overview
The **Voting App** is a real-time web application that allows users to create polls, vote on their favorite options, and see live results. The app is powered by **MongoDB** for data storage and **WebSockets** for real-time communication. 

The application allows users to register, log in, create polls, vote on existing polls, and view live results. This project was built as part of the final exams for the **JavaScript and Database** course.

## Features
- **User Authentication**: Sign up and log in to create or vote in polls.
- **Real-time Voting**: Votes are updated in real-time across all connected users using WebSockets.
- **MongoDB Integration**: The app stores polls and vote results in a MongoDB database hosted on **MongoDB Atlas**.
- **Poll Management**: Admin users can create new polls with multiple options, and everyone can vote.
- **Responsive Design**: The app is fully responsive, providing a smooth experience across different devices.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (hosted on MongoDB Atlas)
- **Real-time Communication**: WebSockets
- **Authentication**: Session-based authentication with **express-session**

## Installation

### Prerequisites
- **Node.js**: Ensure you have Node.js installed. You can download it from [Node.js Official Website](https://nodejs.org/).
- **MongoDB Atlas Account**: Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and set up your cluster.

### Steps to Install
1. **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/voting-app.git
    cd voting-app
    ```

2. **Install Dependencies**:
    Run the following command to install all necessary dependencies:
    ```bash
    npm install
    ```

3. **Setup MongoDB**:
    - Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) if you haven't already.
    - Add your MongoDB connection string in the `index.js` file where it says `MONGO_URI`:
      ```js
      const MONGO_URI = 'your_connection_string_here';
      ```

4. **Start the Application**:
    After the dependencies are installed, run the following command to start the application:
    ```bash
    npm start
    ```

    This will start the app on `http://localhost:3000`. Open it in your browser to use the app.

## Usage

1. **Sign Up / Log In**:
   - First-time users need to sign up to create a poll and vote.
   - After registering, users can log in to access their dashboard.

2. **Create Polls**:
   - Once logged in, you can create a poll by entering a question and providing options for voting.

3. **Vote on Polls**:
   - View the active polls and cast your vote by selecting your favorite option.

4. **Real-time Updates**:
   - The app uses WebSockets to display vote updates in real-time without refreshing the page.

## MongoDB Atlas

The app is connected to MongoDB Atlas to store poll data and results. Follow these steps to set up MongoDB Atlas for your own use:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. Create a new **cluster**.
3. Under **Network Access**, whitelist your IP address.
4. Under **Database Access**, create a new user with **atlasAdmin** permissions.
5. Use the provided connection string in the app to connect to your MongoDB Atlas cluster.

## Deployment

### Local Deployment
1. Clone the repo and follow the **Installation** steps above.
2. Run the app locally by executing:
    ```bash
    npm start
    ```

### Cloud Deployment (Optional)
You can deploy this application using services like **Heroku** or **DigitalOcean**. Follow the official documentation for these services to deploy a Node.js app to the cloud.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Thanks to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for providing cloud-hosted database services.
- WebSocket and Node.js made real-time communication seamless for this project.
- Thanks to [Express.js](https://expressjs.com/) for a powerful and simple backend framework.
