# TrackWise Premium

TrackWise is a premium expense tracking application featuring an intuitive step-by-step wizard for data entry and an advanced dashboard with dynamic charts and PDF export capabilities.

## Architecture
- **Frontend**: Single Page Application (SPA), HTML, CSS (Vanilla), JS (Vanilla), Chart.js, html2pdf.
- **Backend**: Node.js, Express, MySQL, JWT Authentication.

---

## 🚀 How to Run the Project

You will need to run the **Backend** and the **Frontend** simultaneously in two separate terminals.

### 1️⃣ Setting up the Database (One-time)
If you haven't already, ensure your MySQL Server is running and you have initialized the database using the schema:
1. Open MySQL Workbench.
2. Run the SQL script found in `database/schema.sql`.

### 2️⃣ Running the Backend (Terminal 1)
Open a new terminal or command prompt, navigate to the `backend` folder, and start the Node.js server.

```bash
cd "c:\One_Drive\OneDrive\Documents\fullstack_class\FullStack Tasks\trackwise\backend"
npm install
node server.js
```
*The backend will start running on port 5000 (e.g., `http://localhost:5000`).*

### 3️⃣ Running the Frontend (Terminal 2)
Open a second terminal, navigate to the `frontend` folder, and safely serve the static files.

```bash
cd "c:\One_Drive\OneDrive\Documents\fullstack_class\FullStack Tasks\trackwise\frontend"
npx serve -p 8080 .
```
*(If it asks to install `serve`, press `y`)*
*The frontend will start running on port 8080.*

---

## 🌐 Accessing the App
Once both terminals are running successfully:
1. Open your web browser.
2. Go to **[http://localhost:8080](http://localhost:8080)**
3. Register a new account or log in to see the Premium Dashboard!
