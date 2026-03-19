# Campus Coffee and Catering Services Web Application

## Project Name
Campus Coffee and Catering Services Web Application

## Project Overview
This project aims to develop a centralized web application for campus coffee and catering services. The platform will connect students, faculty, event organizers, and food providers in one system.

The main goals of the project are:
- Provide a digital ordering platform for menu browsing, individual orders, and catering bookings
- Support real-time order tracking
- Offer backend management tools for vendors and administrators
- Simulate multiple payment methods
- Support user personalization and dietary preferences
- Deliver complete technical documentation and a final presentation

## Tech Stack
This project follows the **MERN** stack:

- **MongoDB**: database for users, menu items, orders, vendors, catering packages, and feedback
- **Express.js**: backend API framework
- **React.js**: frontend user interface
- **Node.js**: server runtime

### Supporting Tools
- React Router
- Context API
- Axios
- Mongoose ODM
- JWT Authentication
- Swagger or Apifox for API design/documentation
- GitHub for version control
- Figma for UI prototyping

## Team Members and Responsibilities

| Member | Role | Responsibility |
|---|---|---|
| Yanbo Du | Project Manager | Coordinates the team, oversees development phases, manages the GitHub repository, and ensures milestones are completed on time |
| Qijia Di | Frontend Developer | Designs and implements user-facing interfaces using React.js, develops menu browsing and shopping cart components, and ensures mobile responsiveness |
| Bowei Hu | Backend Developer | Develops core business logic APIs including authentication, menu management, and order processing; implements JWT security and request validation |
| Tianshi Yang | Backend Developer | Designs and implements catering service APIs including booking systems and approval workflows; develops sales reporting and vendor management features |
| Yiqi Sun | Database Developer | Manages MongoDB database design and optimization, develops data models for collections, and assists with cloud deployment and server configuration |

## Development Workflow
This project follows an agile development process.

### Workflow Summary
- Two-week sprints
- Daily stand-ups
- Feature branch workflow on GitHub
- Contract-first API design using Swagger or Apifox
- Continuous testing and documentation

### Development Plan
- **Weeks 1–2**: requirements discussion, scope finalization, GitHub setup, UI prototypes
- **Weeks 3–4**: database schema, RESTful API design, JWT authentication
- **Weeks 5–6**: menu browsing, shopping cart, user profile
- **Weeks 7–8**: real-time order tracking, catering booking, vendor management
- **Weeks 9–10**: dashboards, payment simulation, analytics, feedback system
- **Week 11**: testing, bug fixing, mobile optimization
- **Week 12**: deployment, final documentation, presentation

## Figma Link
> Replace this with your actual team Figma link.

[Figma Prototype](https://www.figma.com/)

## Repository Structure
```text
.
├── README.md
├── .gitignore
├── docs/
│   ├── project-scope.md
│   ├── github-workflow.md
│   └── meeting-notes/
│       └── week1-kickoff.md
├── frontend/
└── backend/