import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Animal, User } from '@/data/mockData';

interface AnimalFormProps {
  animal?: Animal | null;
  farmers: User[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AnimalForm: React.FC<AnimalFormProps> = ({ animal, farmers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    animalId: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    ownerId: ''
  });

  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        animalId: animal.animalId || '',
        species: animal.species,
        breed: animal.breed,
        dateOfBirth: animal.dateOfBirth,
        ownerId: animal.ownerId
      });
    }
  }, [animal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Animal Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter animal name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="animalId">Animal ID</Label>
        <Input
          id="animalId"
          type="text"
          placeholder="e.g., COW001, PIG123"
          value={formData.animalId}
          onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="species">Species</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, species: value })} value={formData.species}>
          <SelectTrigger>
            <SelectValue placeholder="Select species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cattle">Cattle</SelectItem>
            <SelectItem value="Pig">Pig</SelectItem>
            <SelectItem value="Sheep">Sheep</SelectItem>
            <SelectItem value="Goat">Goat</SelectItem>
            <SelectItem value="Poultry">Poultry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="breed">Breed</Label>
        <Input
          id="breed"
          type="text"
          placeholder="Enter breed"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner">Assign to Farmer</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, ownerId: value })} value={formData.ownerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select farmer" />
          </SelectTrigger>
          <SelectContent>
            {farmers.map((farmer) => (
              <SelectItem key={farmer.id} value={farmer.id}>
                {farmer.name} ({farmer.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary">
          {animal ? 'Update' : 'Create'} Animal
        </Button>
      </div>
    </form>
  );
};

export default AnimalForm;