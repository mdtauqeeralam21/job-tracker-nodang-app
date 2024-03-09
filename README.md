# Job Tracker App

This is a Job Tracker application built with Node.js and MongoDB. The application allows users to track their job applications, manage reminders, and generate statistics reports. It includes features such as secure authentication using JWT tokens, authorization, reminder functionalities, forgot password functionality, setting job reminders via email, managing applied jobs, and generating Excel sheets for job data.

## Features

- **Secure Authentication:** Users can securely authenticate using JWT tokens.
- **Authorization:** Different levels of authorization are implemented to control access to various functionalities.
- **Reminder Functionality:** Users can set reminders for important events related to job applications.
- **Forgot Password:** Users can reset their password if forgotten.
- **Email Job Reminders:** Users can receive reminders for job-related events via email.
- **Managing Applied Jobs:** Users can manage their applied jobs, including adding, editing, and deleting entries.
- **Statistics Reports:** Users can generate statistics reports on a monthly and daily basis for job applications.
- **Export to Excel:** Users can generate Excel sheets containing job application data.

## Technologies Used

- **Node.js:** Backend server environment.
- **Express.js:** Web application framework for Node.js.
- **MongoDB:** NoSQL database for storing application data.
- **JWT:** JSON Web Tokens for secure authentication.
- **Nodemailer:** For sending emails for reminders.
- **Other dependencies:** Various other Node.js packages for routing, validation, and other functionalities.

## Installation

1. Clone this repository to your local machine.
2. Install dependencies using `npm install`.
3. Configure environment variables as needed.
4. Ensure MongoDB is running locally or provide the appropriate connection URI.
5. Run the application using `npm start`.

## Usage

1. Register an account or log in if you already have one.
2. Add your job applications.
3. Set reminders for important events related to job applications.
4. View and manage applied jobs.
5. Generate statistics reports as needed.
6. Export job data to Excel for further analysis.

## Acknowledgements

- This project was inspired by the need for an efficient way to track job applications and manage related tasks.
