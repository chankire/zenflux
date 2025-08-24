import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Target, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/hooks/useCurrency";

interface KPI {
  id: string;
  name: string;
  target: number;
  unit: string;
  created_at: string;
}

const KPIManager = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    unit: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadKPIs();
  }, [user]);

  const loadKPIs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's organization first
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!membership) return;

      const { data: kpiData, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKpis(kpiData || []);
    } catch (error: any) {
      console.error('Error loading KPIs:', error);
      toast({
        title: "Error loading KPIs",
        description: error.message || "Failed to load KPIs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", target: "", unit: "" });
    setEditingKPI(null);
  };

  const openEditDialog = (kpi: KPI) => {
    setEditingKPI(kpi);
    setFormData({
      name: kpi.name,
      target: kpi.target.toString(),
      unit: kpi.unit
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.target.trim()) {
      toast({
        title: "Invalid input",
        description: "Name and target are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const target = parseFloat(formData.target);
      if (isNaN(target)) {
        toast({
          title: "Invalid target",
          description: "Target must be a number.",
          variant: "destructive",
        });
        return;
      }

      // Get user's organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!membership) throw new Error("No organization found");

      const kpiData = {
        name: formData.name.trim(),
        target,
        unit: formData.unit.trim(),
        organization_id: membership.organization_id
      };

      if (editingKPI) {
        const { error } = await supabase
          .from('kpis')
          .update(kpiData)
          .eq('id', editingKPI.id);

        if (error) throw error;

        toast({
          title: "KPI updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('kpis')
          .insert(kpiData);

        if (error) throw error;

        toast({
          title: "KPI created",
          description: `${formData.name} has been added to your dashboard.`,
        });
      }

      loadKPIs();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving KPI:', error);
      toast({
        title: "Error saving KPI",
        description: error.message || "Failed to save KPI.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (kpi: KPI) => {
    if (!confirm(`Are you sure you want to delete "${kpi.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('kpis')
        .delete()
        .eq('id', kpi.id);

      if (error) throw error;

      toast({
        title: "KPI deleted",
        description: `${kpi.name} has been removed.`,
      });

      loadKPIs();
    } catch (error: any) {
      console.error('Error deleting KPI:', error);
      toast({
        title: "Error deleting KPI",
        description: error.message || "Failed to delete KPI.",
        variant: "destructive",
      });
    }
  };

  const formatTarget = (target: number, unit: string) => {
    if (unit.toLowerCase().includes('currency') || unit === '$' || unit === '€' || unit === '£') {
      return formatCurrency(target);
    }
    return `${target.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Custom KPIs
          </span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add KPI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingKPI ? 'Edit KPI' : 'Add Custom KPI'}
                </DialogTitle>
                <DialogDescription>
                  Set custom targets and track key metrics important to your business.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">KPI Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monthly Recurring Revenue"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target Value</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100000"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., $, %, users, etc."
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingKPI ? 'Update' : 'Create'} KPI
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {kpis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No custom KPIs yet. Add your first KPI to start tracking custom metrics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{kpi.name}</h4>
                  <Badge variant="outline">
                    Target: {formatTarget(kpi.target, kpi.unit)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(kpi)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(kpi)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIManager;