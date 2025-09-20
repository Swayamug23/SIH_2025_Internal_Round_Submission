import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  User
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Users as UsersIcon } from 'lucide-react';

const Users: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as User['role'] | ''
  });

  useEffect(() => {
    if (user?.role !== 'Manager') {
      toast({
        title: "Access Denied",
        description: "Only managers can access user management.",
        variant: "destructive",
      });
      return;
    }
    loadUsers();
  }, [user, toast]);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setFormData({ name: '', email: '', password: '', role: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setIsEditMode(true);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Don't pre-fill password for security
      role: userToEdit.role
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      const deleted = deleteUser(userId);
      if (deleted) {
        loadUsers();
        toast({
          title: "User Deleted",
          description: "The user has been successfully deleted.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditMode && !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && selectedUser) {
        const updateData: Partial<User> = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        
        // Only update password if provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        const updated = updateUser(selectedUser.id, updateData);
        if (updated) {
          toast({
            title: "User Updated",
            description: "The user has been successfully updated.",
          });
        }
      } else {
        const created = createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        if (created) {
          toast({
            title: "User Created",
            description: "The user has been successfully created.",
          });
        }
      }
      
      loadUsers();
      setIsFormOpen(false);
      setFormData({ name: '', email: '', password: '', role: '' });
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the user.",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'Manager') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only farm managers can access user management features.
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage farm staff and veterinarian accounts
          </p>
        </div>
        
        <Button onClick={handleCreate} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          u.role === 'Manager' ? 'status-treatment' :
                          u.role === 'Veterinarian' ? 'status-clear' :
                          'status-withdrawal'
                        }
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(u)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {u.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(u.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the user information below.' 
                : 'Enter the details for the new user.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })} value={formData.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manager">Farm Manager</SelectItem>
                  <SelectItem value="Staff">Farm Staff</SelectItem>
                  <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEditMode && '(leave blank to keep current)'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEditMode ? "Enter new password" : "Enter password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEditMode}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {isEditMode ? 'Update' : 'Create'} User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;