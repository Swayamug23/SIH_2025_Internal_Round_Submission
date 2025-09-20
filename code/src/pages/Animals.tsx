import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  getAnimals, 
  getUsers, 
  getUserById, 
  createAnimal, 
  updateAnimal, 
  deleteAnimal,
  getTreatments,
  getWithdrawalStatus,
  getDaysUntilClearance,
  Animal,
  User
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimalForm from '@/components/AnimalForm';

const Animals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadAnimals();
    loadFarmers();
  }, []);

  const loadAnimals = () => {
    setAnimals(getAnimals());
  };

  const loadFarmers = () => {
    const allUsers = getUsers();
    setFarmers(allUsers.filter(u => u.role === 'Staff' || u.role === 'Manager'));
  };

  const filteredAnimals = animals.filter(animal => 
    animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserById(animal.ownerId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAnimalStatus = (animalId: string) => {
    const treatments = getTreatments().filter(t => t.animalId === animalId);
    if (treatments.length === 0) return { status: 'Clear', daysLeft: 0 };
    
    const latestTreatment = treatments.sort((a, b) => 
      new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
    )[0];
    
    const status = getWithdrawalStatus(latestTreatment.withdrawalEndDate);
    const daysLeft = getDaysUntilClearance(latestTreatment.withdrawalEndDate);
    
    return { status, daysLeft };
  };

  const handleCreate = () => {
    setSelectedAnimal(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (animalId: string) => {
    if (!user || user.role !== 'Manager') {
      toast({
        title: "Access Denied",
        description: "Only managers can delete animals.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this animal?')) {
      const deleted = deleteAnimal(animalId);
      if (deleted) {
        loadAnimals();
        toast({
          title: "Animal Deleted",
          description: "The animal has been successfully deleted.",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (isEditMode && selectedAnimal) {
        const updated = updateAnimal(selectedAnimal.id, formData);
        if (updated) {
          toast({
            title: "Animal Updated",
            description: "The animal has been successfully updated.",
          });
        }
      } else {
        const created = createAnimal(formData);
        if (created) {
          toast({
            title: "Animal Added",
            description: "The animal has been successfully added.",
          });
        }
      }
      
      loadAnimals();
      setIsFormOpen(false);
      setSelectedAnimal(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the animal.",
        variant: "destructive",
      });
    }
  };

  const canManageAnimals = user?.role === 'Manager' || user?.role === 'Staff';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Animal Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your livestock inventory
          </p>
        </div>
        
        {canManageAnimals && (
          <Button onClick={handleCreate} className="bg-gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Animal
          </Button>
        )}
      </div>

      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Animals ({filteredAnimals.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search animals..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map((animal) => {
                  const owner = getUserById(animal.ownerId);
                  const { status, daysLeft } = getAnimalStatus(animal.id);
                  const age = Math.floor((Date.now() - new Date(animal.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                  
                  return (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.name || 'Unnamed'}</TableCell>
                      <TableCell className="font-mono text-sm">{animal.animalId || 'N/A'}</TableCell>
                      <TableCell>{animal.species}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>{age} years</TableCell>
                      <TableCell>{owner?.name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={status === 'Clear' ? 'status-clear' : 'status-withdrawal'}
                        >
                          {status}
                          {status === 'In Withdrawal' && ` (${daysLeft}d)`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/animals/${animal.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {canManageAnimals && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(animal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(animal.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Animal' : 'Add New Animal'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the animal information below.' 
                : 'Enter the details for the new animal.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <AnimalForm
            animal={selectedAnimal}
            farmers={farmers}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Animals;