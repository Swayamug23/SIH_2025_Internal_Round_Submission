import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  getDrugs, 
  createDrug, 
  updateDrug, 
  deleteDrug,
  Drug
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Pill } from 'lucide-react';

const Drugs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    milkWithdrawalHours: 0,
    meatWithdrawalDays: 0
  });

  useEffect(() => {
    if (user?.role !== 'Manager') {
      toast({
        title: "Access Denied",
        description: "Only managers can access drug management.",
        variant: "destructive",
      });
      return;
    }
    loadDrugs();
  }, [user, toast]);

  const loadDrugs = () => {
    setDrugs(getDrugs());
  };

  const filteredDrugs = drugs.filter(drug => 
    drug.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedDrug(null);
    setIsEditMode(false);
    setFormData({ name: '', milkWithdrawalHours: 0, meatWithdrawalDays: 0 });
    setIsFormOpen(true);
  };

  const handleEdit = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsEditMode(true);
    setFormData({
      name: drug.name,
      milkWithdrawalHours: drug.milkWithdrawalHours,
      meatWithdrawalDays: drug.meatWithdrawalDays
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (drugId: string) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      const deleted = deleteDrug(drugId);
      if (deleted) {
        loadDrugs();
        toast({
          title: "Drug Deleted",
          description: "The drug has been successfully deleted.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.milkWithdrawalHours < 0 || formData.meatWithdrawalDays < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && selectedDrug) {
        const updated = updateDrug(selectedDrug.id, formData);
        if (updated) {
          toast({
            title: "Drug Updated",
            description: "The drug has been successfully updated.",
          });
        }
      } else {
        const created = createDrug(formData);
        if (created) {
          toast({
            title: "Drug Added",
            description: "The drug has been successfully added.",
          });
        }
      }
      
      loadDrugs();
      setIsFormOpen(false);
      setFormData({ name: '', milkWithdrawalHours: 0, meatWithdrawalDays: 0 });
      setSelectedDrug(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the drug.",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'Manager') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only farm managers can access drug management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Drug Management</h1>
          <p className="text-muted-foreground">
            Manage veterinary drugs and withdrawal periods
          </p>
        </div>
        
        <Button onClick={handleCreate} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Drug
        </Button>
      </div>

      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Drugs ({filteredDrugs.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search drugs..."
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
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Milk Withdrawal (Hours)</TableHead>
                  <TableHead>Meat Withdrawal (Days)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell className="font-medium">{drug.name}</TableCell>
                    <TableCell>{drug.milkWithdrawalHours}</TableCell>
                    <TableCell>{drug.meatWithdrawalDays}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(drug)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(drug.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Drug Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Drug' : 'Add New Drug'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the drug information below.' 
                : 'Enter the details for the new drug.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Drug Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter drug name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milkWithdrawal">Milk Withdrawal Period (Hours)</Label>
              <Input
                id="milkWithdrawal"
                type="number"
                min="0"
                placeholder="Enter hours"
                value={formData.milkWithdrawalHours}
                onChange={(e) => setFormData({ ...formData, milkWithdrawalHours: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meatWithdrawal">Meat Withdrawal Period (Days)</Label>
              <Input
                id="meatWithdrawal"
                type="number"
                min="0"
                placeholder="Enter days"
                value={formData.meatWithdrawalDays}
                onChange={(e) => setFormData({ ...formData, meatWithdrawalDays: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {isEditMode ? 'Update' : 'Add'} Drug
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Drugs;