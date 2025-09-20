import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  getAnimalById, 
  getUserById, 
  getTreatments,
  getSymptomReports,
  getDrugById,
  getWithdrawalStatus,
  getDaysUntilClearance,
  Animal,
  Treatment,
  SymptomReport
} from '@/data/mockData';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Stethoscope, FileText } from 'lucide-react';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [reports, setReports] = useState<SymptomReport[]>([]);

  useEffect(() => {
    if (id) {
      const animalData = getAnimalById(id);
      setAnimal(animalData || null);
      
      if (animalData) {
        setTreatments(getTreatments().filter(t => t.animalId === id));
        setReports(getSymptomReports().filter(r => r.animalId === id));
      }
    }
  }, [id]);

  if (!animal) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Animal Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested animal could not be found.
            </p>
            <Button onClick={() => navigate('/animals')}>
              Return to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const owner = getUserById(animal.ownerId);
  const latestTreatment = treatments.sort((a, b) => 
    new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
  )[0];
  
  const currentStatus = latestTreatment 
    ? getWithdrawalStatus(latestTreatment.withdrawalEndDate)
    : 'Clear';
  
  const daysLeft = latestTreatment 
    ? getDaysUntilClearance(latestTreatment.withdrawalEndDate)
    : 0;

  const age = Math.floor((Date.now() - new Date(animal.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/animals')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animals
        </Button>
      </div>

      {/* Animal Overview */}
      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{animal.species} - {animal.breed}</CardTitle>
              <p className="text-muted-foreground">Animal ID: {animal.id}</p>
            </div>
            <Badge 
              variant="outline"
              className={`text-sm px-3 py-1 ${currentStatus === 'Clear' ? 'status-clear' : 'status-withdrawal'}`}
            >
              {currentStatus}
              {currentStatus === 'In Withdrawal' && ` (${daysLeft} days left)`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years old</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(animal.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{owner?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment History */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Treatment History ({treatments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {treatments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drug</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.map((treatment) => {
                      const drug = getDrugById(treatment.drugId);
                      const status = getWithdrawalStatus(treatment.withdrawalEndDate);
                      
                      return (
                        <TableRow key={treatment.id}>
                          <TableCell className="font-medium">{drug?.name}</TableCell>
                          <TableCell>{new Date(treatment.treatmentDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={status === 'Clear' ? 'status-clear' : 'status-withdrawal'}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No treatments recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Symptom Reports */}
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Symptom Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => {
                  const reporter = getUserById(report.reportedById);
                  
                  return (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm text-muted-foreground">
                          Reported by {reporter?.name}
                        </div>
                        <Badge 
                          variant="outline"
                          className={report.status === 'OPEN' ? 'status-treatment' : 'status-clear'}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{report.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No symptom reports</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnimalDetail;