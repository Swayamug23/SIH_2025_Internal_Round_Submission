import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getTreatments, 
  getAnimals, 
  getDrugs,
  getSymptomReports,
  getUserById, 
  getAnimalById,
  getDrugById,
  getSymptomReportById,
  createTreatment,
  updateTreatment,
  updateSymptomReport,
  calculateWithdrawalEndDate,
  getWithdrawalStatus,
  getDaysUntilClearance,
  getAIRecommendation,
  Treatment,
  Animal,
  Drug
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Stethoscope, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Treatments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    animalId: '',
    drugId: '',
    diagnosis: '',
    dosage: '',
    reportId: ''
  });

  useEffect(() => {
    loadTreatments();
    loadAnimals();
    loadDrugs();
    
    // Check if we need to open the form with pre-filled data
    const urlParams = new URLSearchParams(location.search);
    const reportId = urlParams.get('reportId');
    const animalId = urlParams.get('animalId');
    
    if (reportId && animalId) {
      setFormData(prev => ({ ...prev, reportId, animalId }));
      setIsFormOpen(true);
    }
  }, [location.search]);

  const loadTreatments = () => {
    setTreatments(getTreatments());
  };

  const loadAnimals = () => {
    setAnimals(getAnimals());
  };

  const loadDrugs = () => {
    setDrugs(getDrugs());
  };

  const filteredTreatments = treatments.filter(treatment => {
    const animal = getAnimalById(treatment.animalId);
    const drug = getDrugById(treatment.drugId);
    const vet = getUserById(treatment.administeredById);
    
    return (
      animal?.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal?.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateTreatment = () => {
    setFormData({ animalId: '', drugId: '', diagnosis: '', dosage: '', reportId: '' });
    setIsFormOpen(true);
  };

  const handleGetRecommendation = () => {
    if (formData.diagnosis.trim()) {
      const recommendedDrug = getAIRecommendation(formData.diagnosis);
      const drug = drugs.find(d => d.name === recommendedDrug);
      
      if (drug) {
        setFormData(prev => ({ ...prev, drugId: drug.id }));
        toast({
          title: "AI Recommendation",
          description: `Based on the diagnosis, ${recommendedDrug} is recommended.`,
        });
      }
    } else {
      toast({
        title: "No Diagnosis",
        description: "Please enter a diagnosis first to get a recommendation.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'Veterinarian') {
      toast({
        title: "Access Denied",
        description: "Only veterinarians can create treatments.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.animalId || !formData.drugId || !formData.diagnosis.trim() || !formData.dosage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedDrug = getDrugById(formData.drugId);
      if (!selectedDrug) {
        throw new Error('Selected drug not found');
      }

      const treatmentDate = new Date().toISOString();
      const withdrawalEndDate = calculateWithdrawalEndDate(treatmentDate, selectedDrug.milkWithdrawalHours);

      const newTreatment = createTreatment({
        animalId: formData.animalId,
        drugId: formData.drugId,
        administeredById: user.id,
        diagnosis: formData.diagnosis,
        dosage: formData.dosage,
        treatmentDate,
        withdrawalEndDate,
        linkedReportId: formData.reportId || undefined
      });

      // If this treatment is linked to a report, mark the report as treated
      if (formData.reportId) {
        updateSymptomReport(formData.reportId, { status: 'TREATED' });
      }

      if (newTreatment) {
        loadTreatments();
        setIsFormOpen(false);
        setFormData({ animalId: '', drugId: '', diagnosis: '', dosage: '', reportId: '' });
        
        // Clear URL parameters
        navigate('/treatments', { replace: true });
        
        toast({
          title: "Treatment Created",
          description: "Treatment has been successfully recorded.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the treatment.",
        variant: "destructive",
      });
    }
  };

  const canCreateTreatments = user?.role === 'Veterinarian';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treatment Records</h1>
          <p className="text-muted-foreground">
            Monitor animal treatments and withdrawal periods
          </p>
        </div>
        
        {canCreateTreatments && (
          <Button onClick={handleCreateTreatment} className="bg-gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Treatment
          </Button>
        )}
      </div>

      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Treatments ({filteredTreatments.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Veterinarian</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTreatments.map((treatment) => {
                  const animal = getAnimalById(treatment.animalId);
                  const drug = getDrugById(treatment.drugId);
                  const vet = getUserById(treatment.administeredById);
                  const status = getWithdrawalStatus(treatment.withdrawalEndDate);
                  const daysLeft = getDaysUntilClearance(treatment.withdrawalEndDate);
                  
                  return (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">
                        {animal?.species} - {animal?.breed}
                      </TableCell>
                      <TableCell>{drug?.name}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={treatment.diagnosis}>
                          {treatment.diagnosis}
                        </div>
                      </TableCell>
                      <TableCell>{vet?.name}</TableCell>
                      <TableCell>
                        {new Date(treatment.treatmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={status === 'Clear' ? 'status-clear' : 'status-withdrawal'}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {status === 'In Withdrawal' ? `${daysLeft} days` : 'Cleared'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Treatment Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Treatment Record</DialogTitle>
            <DialogDescription>
              Record a new treatment for an animal.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitTreatment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="animal">Select Animal</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, animalId: value })}
                value={formData.animalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.species} - {animal.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Enter the diagnosis..."
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="min-h-20"
                required
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetRecommendation}
                className="mt-2"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Recommendation
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drug">Select Drug</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, drugId: value })}
                value={formData.drugId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a drug" />
                </SelectTrigger>
                <SelectContent>
                  {drugs.map((drug) => (
                    <SelectItem key={drug.id} value={drug.id}>
                      {drug.name} (Withdrawal: {drug.milkWithdrawalHours}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                type="text"
                placeholder="e.g., 5ml intramuscular"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>

            {formData.reportId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This treatment will be linked to symptom report #{formData.reportId}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Create Treatment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Treatments;