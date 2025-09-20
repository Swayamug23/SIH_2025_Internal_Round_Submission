# Livestock MRL & AMU Management Portal

A comprehensive farm management system for monitoring livestock health, tracking treatments, and ensuring compliance with MRL (Maximum Residue Limits) and AMU (Antimicrobial Use) regulations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🌟 Features

### Role-Based Access Control
- **Farm Manager**: Full admin access - CRUD animals, drugs, users, assign animals to farmers
- **Farm Staff**: Log animal symptoms and create symptom reports
- **Veterinarian**: View symptom reports and create treatments with AI drug recommendations

### Core Functionality
- **Animal Management**: Track livestock with breed, age, ownership, and health status
- **Symptom Reporting**: Staff can log health concerns and symptoms
- **Treatment Records**: Veterinarians can prescribe treatments with automatic withdrawal calculations
- **Drug Management**: Maintain drug database with withdrawal periods
- **User Management**: Admin can manage staff and veterinarian accounts
- **Withdrawal Tracking**: Automatic calculation and alerts for withdrawal periods
- **AI Recommendations**: Smart drug suggestions based on diagnosis

### Dashboard Features
- Real-time KPIs and metrics
- Withdrawal period alerts and countdowns
- Treatment trends and animal distribution charts
- Recent activity feeds

## 🔐 Demo Accounts

| Role | Email | Password |
|------|--------|----------|
| Manager | manager@farm.com | password |
| Staff | staff@farm.com | password |
| Veterinarian | vet@farm.com | password |

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Context + localStorage
- **Charts**: Custom SVG-based charts
- **Icons**: Lucide React

## 📋 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI primitives
│   ├── Layout.tsx      # Main app layout with sidebar
│   └── AnimalForm.tsx  # Animal creation/editing form
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── data/              # Mock data layer
│   └── mockData.ts    # In-memory data store with helper functions
├── pages/             # Route components
│   ├── Dashboard.tsx   # Main dashboard with KPIs
│   ├── Login.tsx      # Authentication page
│   ├── Animals.tsx    # Animal management
│   ├── Reports.tsx    # Symptom reporting
│   ├── Treatments.tsx # Treatment records
│   ├── Users.tsx      # User management (Manager only)
│   └── Drugs.tsx      # Drug management (Manager only)
└── hooks/             # Custom React hooks
```

## 🎨 Design System

The application uses a farm-themed design with:
- Green gradient primary colors
- Consistent spacing and typography
- Responsive layout with collapsible sidebar
- Status badges with semantic colors
- Professional card-based UI

## 🔒 Security Features

- Role-based route protection
- Authentication with mock JWT tokens
- Input validation and sanitization
- Secure password handling (mock implementation)

## 📊 Key Calculations

- **Withdrawal End Date**: Treatment date + drug withdrawal hours
- **Days Until Clearance**: Calculated in real-time
- **Animal Status**: Clear vs In Withdrawal based on current date
- **AI Recommendations**: Rule-based drug suggestions

## 🚨 Important Notes

- This is a **prototype/demo application** with mock data
- No real database - uses in-memory storage
- Authentication is simplified for demo purposes
- All data resets on page refresh

## 🔄 Data Flow

1. **Staff** logs animal symptoms → Creates symptom reports
2. **Veterinarian** reviews reports → Creates treatments with drug selection
3. **System** calculates withdrawal periods → Updates animal status
4. **Dashboard** displays real-time alerts → Tracks withdrawal countdowns
5. **Manager** oversees all operations → Manages users, drugs, and animals

## 🌐 Deployment

Built with Vite for optimal performance and fast hot reloading during development. Ready for deployment to any static hosting service.

---

**Note**: This is a hackathon prototype demonstrating livestock management concepts. For production use, implement proper database integration, enhanced security, and regulatory compliance features.