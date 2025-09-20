import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  getSymptomReports, 
  getAnimals, 
  getUserById, 
  getAnimalById,
  createSymptomReport,
  updateSymptomReport,
  SymptomReport,
  Animal
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Search, Stethoscope } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'TREATED'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTreatmentFormOpen, setIsTreatmentFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SymptomReport | null>(null);
  
  const [formData, setFormData] = useState({
    animalId: '',
    description: ''
  });

  useEffect(() => {
    loadReports();
    loadAnimals();
  }, []);

  const loadReports = () => {
    setReports(getSymptomReports());
  };

  const loadAnimals = () => {
    setAnimals(getAnimals());
  };

  const filteredReports = reports.filter(report => {
    const animal = getAnimalById(report.animalId);
    const reporter = getUserById(report.reportedById);
    
    const matchesSearch = 
      animal?.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal?.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporter?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = () => {
    setFormData({ animalId: '', description: '' });
    setIsFormOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.animalId || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newReport = createSymptomReport({
        animalId: formData.animalId,
        reportedById: user.id,
        description: formData.description,
        status: 'OPEN'
      });

      if (newReport) {
        loadReports();
        setIsFormOpen(false);
        setFormData({ animalId: '', description: '' });
        
        toast({
          title: "Report Created",
          description: "Symptom report has been successfully created.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the report.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTreatment = (report: SymptomReport) => {
    if (user?.role !== 'Veterinarian') {
      toast({
        title: "Access Denied",
        description: "Only veterinarians can create treatments.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedReport(report);
    setIsTreatmentFormOpen(true);
  };

  const canCreateReports = user?.role === 'Staff' || user?.role === 'Manager';
  const canCreateTreatments = user?.role === 'Veterinarian';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Symptom Reports</h1>
          <p className="text-muted-foreground">
            Monitor animal health and manage symptom reports
          </p>
        </div>
        
        {canCreateReports && (
          <Button onClick={handleCreateReport} className="bg-gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Log Symptoms
          </Button>
        )}
      </div>

      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>Reports ({filteredReports.length})</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="TREATED">Treated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const animal = getAnimalById(report.animalId);
                  const reporter = getUserById(report.reportedById);
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {animal?.species} - {animal?.breed}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={report.description}>
                          {report.description}
                        </div>
                      </TableCell>
                      <TableCell>{reporter?.name}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={report.status === 'OPEN' ? 'status-treatment' : 'status-clear'}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === 'OPEN' && canCreateTreatments && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateTreatment(report)}
                            className="text-primary hover:text-primary"
                          >
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Create Treatment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Animal Symptoms</DialogTitle>
            <DialogDescription>
              Report symptoms or health concerns for an animal.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="animal">Select Animal</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, animalId: value })}>
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
              <Label htmlFor="description">Symptoms Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the symptoms you've observed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-24"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Submit Report
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Treatment Creation Dialog */}
      {selectedReport && (
        <Dialog open={isTreatmentFormOpen} onOpenChange={setIsTreatmentFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Treatment</DialogTitle>
              <DialogDescription>
                Create a treatment plan for the reported symptoms.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Symptom Report</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => {
                    // Navigate to treatment creation with pre-filled data
                    window.location.href = `/treatments/new?reportId=${selectedReport.id}&animalId=${selectedReport.animalId}`;
                  }}
                  className="bg-gradient-primary"
                >
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Go to Treatment Form
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Reports;