# 🚀 TalentBridge

TalentBridge is an AI-powered job portal that connects jobseekers and recruiters while providing intelligent skill analysis and guidance to help candidates become job-ready.

---

## 📌 Overview

Traditional job portals focus only on job listings and applications. TalentBridge enhances this process by analyzing candidate skills, calculating job compatibility, and suggesting improvements through AI.

---

## ✨ Features

### Jobseeker
- Browse and search jobs
- Apply to job postings
- View skill match percentage
- Identify matched and missing skills
- Receive AI-generated learning guidance
- Track application status and interview rounds

### Recruiter
- Create and manage company profile
- Post job openings
- View and manage applicants
- Create and manage interview rounds
- Update candidate status (Waiting, Ongoing, Accepted, Rejected)

### AI Capabilities
- Skill matching using similarity algorithms
- Missing skill detection
- AI-based learning recommendations
- Personalized skill improvement suggestions

### Notifications
- Email updates for interview rounds and status changes

---

## 🛠️ Tech Stack

**Frontend**
- Next.js
- Tailwind CSS

**Backend**
- Spring Boot
- REST APIs

**Database**
- MySQL

**Authentication**
- JWT (JSON Web Token)

**AI Integration**
- External AI API (e.g., GroqCloud)

---

## 🏗️ Architecture


Frontend (Next.js)
↓
Backend (Spring Boot)
↓
Database (MySQL)

AI API ↔ Backend ↔ Frontend


---

## ⚙️ Working

1. Jobseeker creates profile and adds skills  
2. Recruiter posts job with required skills  
3. System compares skills and calculates match percentage  
4. Displays matched and missing skills  
5. AI generates guidance for missing skills  
6. Recruiter manages hiring process through interview rounds  
7. Candidate tracks application progress  

---

## 📂 Project Structure


talentbridge/
├── frontend/
├── backend/
├── database/
└── docs/


---

## 🚀 Setup Instructions

### Clone Repository

git clone https://github.com/your-username/talentbridge.git

cd talentbridge


### Backend Setup

cd backend
mvn spring-boot:run


### Frontend Setup

cd frontend
npm install
npm run dev


---

## 🔐 Environment Variables

Frontend (.env)

NEXT_PUBLIC_API_URL=http://localhost:8080

NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key


Backend (application.properties)

spring.datasource.url=jdbc:mysql://localhost:3306/talentbridge
spring.datasource.username=root
spring.datasource.password=yourpassword
jwt.secret=your_secret_key


---

## 🔮 Future Scope

- Resume parsing using AI  
- AI-based mock interviews  
- Real-time chat system  
- Advanced job recommendation engine  
- Video interview integration  

---

## 👨‍💻 Authors

- Pranav Molawade  
- (Add team members)

---

## 📄 License

This project is developed for academic purposes.
