// Mock data store for the livestock management system
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Manager' | 'Staff' | 'Veterinarian';
}

export interface Animal {
  id: string;
  name: string;
  animalId: string;
  species: string;
  dateOfBirth: string;
  breed: string;
  ownerId: string;
  createdAt: string;
}

export interface Drug {
  id: string;
  name: string;
  milkWithdrawalHours: number;
  meatWithdrawalDays: number;
}

export interface SymptomReport {
  id: string;
  animalId: string;
  reportedById: string;
  description: string;
  createdAt: string;
  status: 'OPEN' | 'TREATED';
  assignedVetId?: string;
}

export interface Treatment {
  id: string;
  animalId: string;
  drugId: string;
  administeredById: string;
  diagnosis: string;
  dosage: string;
  treatmentDate: string;
  withdrawalEndDate: string;
  linkedReportId?: string;
}

// Mock data arrays
let users: User[] = [
  {
    id: '1',
    name: 'John Manager',
    email: 'manager@farm.com',
    password: 'password',
    role: 'Manager'
  },
  {
    id: '2',
    name: 'Jane Staff',
    email: 'staff@farm.com',
    password: 'password',
    role: 'Staff'
  },
  {
    id: '3',
    name: 'Dr. Smith',
    email: 'vet@farm.com',
    password: 'password',
    role: 'Veterinarian'
  },
  {
    id: '4',
    name: 'Mike Farmer',
    email: 'farmer@farm.com',
    password: 'password',
    role: 'Staff'
  }
];

let animals: Animal[] = [
  {
    id: '1',
    name: 'Bessie',
    animalId: 'COW001',
    species: 'Cattle',
    dateOfBirth: '2022-03-15',
    breed: 'Holstein',
    ownerId: '4',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Thunder',
    animalId: 'BULL002',
    species: 'Cattle',
    dateOfBirth: '2021-08-22',
    breed: 'Angus',
    ownerId: '4',
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Porky',
    animalId: 'PIG003',
    species: 'Pig',
    dateOfBirth: '2023-01-10',
    breed: 'Yorkshire',
    ownerId: '2',
    createdAt: '2024-02-01T09:15:00Z'
  }
];

let drugs: Drug[] = [
  {
    id: '1',
    name: 'Penicillin',
    milkWithdrawalHours: 72,
    meatWithdrawalDays: 10
  },
  {
    id: '2',
    name: 'Tylosin',
    milkWithdrawalHours: 96,
    meatWithdrawalDays: 14
  },
  {
    id: '3',
    name: 'Oxytetracycline',
    milkWithdrawalHours: 120,
    meatWithdrawalDays: 21
  }
];

let symptomReports: SymptomReport[] = [
  {
    id: '1',
    animalId: '1',
    reportedById: '2',
    description: 'Cow showing signs of mastitis - swollen udder, reduced milk production',
    createdAt: '2024-09-10T08:30:00Z',
    status: 'OPEN'
  },
  {
    id: '2',
    animalId: '2',
    reportedById: '4',
    description: 'Bull appears lethargic, not eating well, possible respiratory issue',
    createdAt: '2024-09-12T14:20:00Z',
    status: 'TREATED',
    assignedVetId: '3'
  }
];

let treatments: Treatment[] = [
  {
    id: '1',
    animalId: '2',
    drugId: '2',
    administeredById: '3',
    diagnosis: 'Respiratory infection',
    dosage: '5ml intramuscular',
    treatmentDate: '2024-09-13T10:00:00Z',
    withdrawalEndDate: '2024-09-17T10:00:00Z',
    linkedReportId: '2'
  }
];

// Helper functions
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getUsers = () => [...users];
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getUserByEmail = (email: string) => users.find(u => u.email === email);
export const createUser = (userData: Omit<User, 'id'>) => {
  const newUser = { ...userData, id: generateId() };
  users.push(newUser);
  return newUser;
};
export const updateUser = (id: string, userData: Partial<User>) => {
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    return users[index];
  }
  return null;
};
export const deleteUser = (id: string) => {
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

export const getAnimals = () => [...animals];
export const getAnimalById = (id: string) => animals.find(a => a.id === id);
export const createAnimal = (animalData: Omit<Animal, 'id' | 'createdAt'>) => {
  const newAnimal = { ...animalData, id: generateId(), createdAt: new Date().toISOString() };
  animals.push(newAnimal);
  return newAnimal;
};
export const updateAnimal = (id: string, animalData: Partial<Animal>) => {
  const index = animals.findIndex(a => a.id === id);
  if (index !== -1) {
    animals[index] = { ...animals[index], ...animalData };
    return animals[index];
  }
  return null;
};
export const deleteAnimal = (id: string) => {
  const index = animals.findIndex(a => a.id === id);
  if (index !== -1) {
    return animals.splice(index, 1)[0];
  }
  return null;
};

export const getDrugs = () => [...drugs];
export const getDrugById = (id: string) => drugs.find(d => d.id === id);
export const createDrug = (drugData: Omit<Drug, 'id'>) => {
  const newDrug = { ...drugData, id: generateId() };
  drugs.push(newDrug);
  return newDrug;
};
export const updateDrug = (id: string, drugData: Partial<Drug>) => {
  const index = drugs.findIndex(d => d.id === id);
  if (index !== -1) {
    drugs[index] = { ...drugs[index], ...drugData };
    return drugs[index];
  }
  return null;
};
export const deleteDrug = (id: string) => {
  const index = drugs.findIndex(d => d.id === id);
  if (index !== -1) {
    return drugs.splice(index, 1)[0];
  }
  return null;
};

export const getSymptomReports = () => [...symptomReports];
export const getSymptomReportById = (id: string) => symptomReports.find(r => r.id === id);
export const createSymptomReport = (reportData: Omit<SymptomReport, 'id' | 'createdAt'>) => {
  const newReport = { ...reportData, id: generateId(), createdAt: new Date().toISOString() };
  symptomReports.push(newReport);
  return newReport;
};
export const updateSymptomReport = (id: string, reportData: Partial<SymptomReport>) => {
  const index = symptomReports.findIndex(r => r.id === id);
  if (index !== -1) {
    symptomReports[index] = { ...symptomReports[index], ...reportData };
    return symptomReports[index];
  }
  return null;
};
export const deleteSymptomReport = (id: string) => {
  const index = symptomReports.findIndex(r => r.id === id);
  if (index !== -1) {
    return symptomReports.splice(index, 1)[0];
  }
  return null;
};

export const getTreatments = () => [...treatments];
export const getTreatmentById = (id: string) => treatments.find(t => t.id === id);
export const createTreatment = (treatmentData: Omit<Treatment, 'id'>) => {
  const newTreatment = { ...treatmentData, id: generateId() };
  treatments.push(newTreatment);
  return newTreatment;
};
export const updateTreatment = (id: string, treatmentData: Partial<Treatment>) => {
  const index = treatments.findIndex(t => t.id === id);
  if (index !== -1) {
    treatments[index] = { ...treatments[index], ...treatmentData };
    return treatments[index];
  }
  return null;
};
export const deleteTreatment = (id: string) => {
  const index = treatments.findIndex(t => t.id === id);
  if (index !== -1) {
    return treatments.splice(index, 1)[0];
  }
  return null;
};

// Utility functions
export const calculateWithdrawalEndDate = (treatmentDate: string, milkWithdrawalHours: number): string => {
  const treatment = new Date(treatmentDate);
  treatment.setHours(treatment.getHours() + milkWithdrawalHours);
  return treatment.toISOString();
};

export const getWithdrawalStatus = (withdrawalEndDate: string): 'Clear' | 'In Withdrawal' => {
  return new Date() > new Date(withdrawalEndDate) ? 'Clear' : 'In Withdrawal';
};

export const getDaysUntilClearance = (withdrawalEndDate: string): number => {
  const now = new Date();
  const endDate = new Date(withdrawalEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// AI recommendation logic
export const getAIRecommendation = (diagnosis: string): string => {
  const lowerDiagnosis = diagnosis.toLowerCase();
  
  if (lowerDiagnosis.includes('mastitis') || lowerDiagnosis.includes('udder')) {
    return 'Penicillin';
  } else if (lowerDiagnosis.includes('respiratory') || lowerDiagnosis.includes('cough') || lowerDiagnosis.includes('breathing')) {
    return 'Tylosin';
  } else if (lowerDiagnosis.includes('infection') || lowerDiagnosis.includes('fever')) {
    return 'Oxytetracycline';
  } else {
    return 'Penicillin'; // Default recommendation
  }
};