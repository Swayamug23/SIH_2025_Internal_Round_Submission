import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getAnimals, 
  getSymptomReports, 
  getTreatments, 
  getUsers,
  getUserById,
  getAnimalById,
  getDrugById,
  getWithdrawalStatus,
  getDaysUntilClearance,
  Animal,
  Treatment,
  SymptomReport
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Beef, 
  FileText, 
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<any>;
  trend?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon: Icon, trend }) => (
  <Card className="bg-gradient-card shadow-soft border-0">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && (
        <div className="flex items-center text-xs text-success mt-1">
          <TrendingUp className="mr-1 h-3 w-3" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

interface SimpleChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
}

const SimpleBarChart: React.FC<SimpleChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card className="bg-gradient-card shadow-soft border-0">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium">{item.name}</div>
              <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-in-out rounded-full"
                  style={{ 
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <div className="w-8 text-sm text-right font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState<{
    inWithdrawal: Treatment[];
    expiringSoon: Treatment[];
  }>({ inWithdrawal: [], expiringSoon: [] });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const animalsData = getAnimals();
    const reportsData = getSymptomReports();
    const treatmentsData = getTreatments();

    setAnimals(animalsData);
    setReports(reportsData);
    setTreatments(treatmentsData);

    // Calculate withdrawal alerts
    const inWithdrawal: Treatment[] = [];
    const expiringSoon: Treatment[] = [];

    treatmentsData.forEach(treatment => {
      const status = getWithdrawalStatus(treatment.withdrawalEndDate);
      const daysUntil = getDaysUntilClearance(treatment.withdrawalEndDate);

      if (status === 'In Withdrawal') {
        inWithdrawal.push(treatment);
        if (daysUntil <= 2 && daysUntil > 0) {
          expiringSoon.push(treatment);
        }
      }
    });

    setWithdrawalAlerts({ inWithdrawal, expiringSoon });
  };

  const getSpeciesData = () => {
    const speciesCount = animals.reduce((acc, animal) => {
      acc[animal.species] = (acc[animal.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
    return Object.entries(speciesCount).map(([species, count], index) => ({
      name: species,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const getTreatmentTrends = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: treatments.filter(t => t.treatmentDate.startsWith(date)).length,
      color: 'hsl(var(--primary))'
    }));
  };

  const openReports = reports.filter(r => r.status === 'OPEN');
  const usersCount = getUsers().length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-foreground/90">
          Here's what's happening on your farm today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Animals"
          value={animals.length}
          description="Active animals in your care"
          icon={Beef}
          trend="+2 this week"
        />
        <KPICard
          title="Open Reports"
          value={openReports.length}
          description="Symptom reports pending review"
          icon={FileText}
        />
        <KPICard
          title="In Withdrawal"
          value={withdrawalAlerts.inWithdrawal.length}
          description="Animals currently in withdrawal"
          icon={Clock}
        />
        <KPICard
          title="Total Treatments"
          value={treatments.length}
          description="Treatments administered"
          icon={Stethoscope}
          trend="+5 this month"
        />
      </div>

      {/* Alerts Section */}
      {(withdrawalAlerts.inWithdrawal.length > 0 || withdrawalAlerts.expiringSoon.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Withdrawal Alerts
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {withdrawalAlerts.inWithdrawal.length > 0 && (
              <Alert className="bg-warning/5 border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription>
                  <div className="font-medium mb-2">Animals Currently in Withdrawal ({withdrawalAlerts.inWithdrawal.length})</div>
                  <div className="space-y-2">
                    {withdrawalAlerts.inWithdrawal.slice(0, 3).map(treatment => {
                      const animal = getAnimalById(treatment.animalId);
                      const drug = getDrugById(treatment.drugId);
                      const daysUntil = getDaysUntilClearance(treatment.withdrawalEndDate);
                      
                      return (
                        <div key={treatment.id} className="flex items-center justify-between text-sm">
                          <span>{animal?.species} - {animal?.breed}</span>
                          <Badge variant="outline" className="status-withdrawal">
                            {daysUntil} days left
                          </Badge>
                        </div>
                      );
                    })}
                    {withdrawalAlerts.inWithdrawal.length > 3 && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => navigate('/treatments')}
                        className="p-0 h-auto text-warning"
                      >
                        View all {withdrawalAlerts.inWithdrawal.length} animals
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {withdrawalAlerts.expiringSoon.length > 0 && (
              <Alert className="bg-success/5 border-success/20">
                <Activity className="h-4 w-4 text-success" />
                <AlertDescription>
                  <div className="font-medium mb-2">Clearing Soon ({withdrawalAlerts.expiringSoon.length})</div>
                  <div className="space-y-2">
                    {withdrawalAlerts.expiringSoon.map(treatment => {
                      const animal = getAnimalById(treatment.animalId);
                      const daysUntil = getDaysUntilClearance(treatment.withdrawalEndDate);
                      
                      return (
                        <div key={treatment.id} className="flex items-center justify-between text-sm">
                          <span>{animal?.species} - {animal?.breed}</span>
                          <Badge variant="outline" className="status-clear">
                            {daysUntil} days left
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={getSpeciesData()} 
          title="Animals by Species"
        />
        <SimpleBarChart 
          data={getTreatmentTrends()} 
          title="Treatments This Week"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 5).map(report => {
                const animal = getAnimalById(report.animalId);
                const reporter = getUserById(report.reportedById);
                
                return (
                  <div key={report.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{animal?.species} - {animal?.breed}</div>
                      <div className="text-sm text-muted-foreground">
                        Reported by {reporter?.name}
                      </div>
                    </div>
                    <Badge 
                      variant={report.status === 'OPEN' ? 'destructive' : 'default'}
                      className={report.status === 'OPEN' ? 'status-treatment' : 'status-clear'}
                    >
                      {report.status}
                    </Badge>
                  </div>
                );
              })}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/reports')}
              >
                View All Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Recent Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatments.slice(0, 5).map(treatment => {
                const animal = getAnimalById(treatment.animalId);
                const drug = getDrugById(treatment.drugId);
                const vet = getUserById(treatment.administeredById);
                
                return (
                  <div key={treatment.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{animal?.species} - {drug?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        By {vet?.name}
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getWithdrawalStatus(treatment.withdrawalEndDate) === 'Clear' ? 'status-clear' : 'status-withdrawal'}
                    >
                      {getWithdrawalStatus(treatment.withdrawalEndDate)}
                    </Badge>
                  </div>
                );
              })}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/treatments')}
              >
                View All Treatments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;