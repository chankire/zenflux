-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('org_owner', 'admin', 'treasury_manager', 'contributor', 'viewer');
CREATE TYPE public.connection_status AS ENUM ('connected', 'disconnected', 'error', 'syncing');
CREATE TYPE public.forecast_method AS ENUM ('tft', 'lstm', 'nbeats', 'deepar', 'xgboost', 'prophet', 'arima', 'ensemble', 'baseline');
CREATE TYPE public.forecast_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE public.task_type AS ENUM ('submission', 'approval');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  base_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization memberships
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Bank connections
CREATE TABLE public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'manual',
  status connection_status DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  credentials_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bank accounts
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  masked_number TEXT,
  account_type TEXT DEFAULT 'checking',
  current_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories for transactions
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  value_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  counterparty TEXT,
  memo TEXT,
  external_id TEXT,
  is_forecast BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Balance snapshots
CREATE TABLE public.balance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  as_of DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bank_account_id, as_of)
);

-- Forecast models
CREATE TABLE public.forecast_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  horizon_days INTEGER DEFAULT 90,
  frequency TEXT DEFAULT 'daily',
  status forecast_status DEFAULT 'pending',
  method forecast_method DEFAULT 'ensemble',
  feature_config JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forecast runs
CREATE TABLE public.forecast_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.forecast_models(id) ON DELETE CASCADE,
  ran_by UUID REFERENCES public.profiles(id),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status forecast_status DEFAULT 'pending',
  metrics JSONB DEFAULT '{}',
  confidence JSONB DEFAULT '{}',
  backtest JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forecast outputs
CREATE TABLE public.forecast_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.forecast_runs(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  lower_bound DECIMAL(15,2),
  upper_bound DECIMAL(15,2),
  confidence_level DECIMAL(3,2) DEFAULT 0.90,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scenarios
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_model_id UUID REFERENCES public.forecast_models(id),
  overlays JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments system
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  text TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  thread_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners can update their organization" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'org_owner'
    )
  );

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles in their organizations" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT m1.user_id FROM public.memberships m1
      WHERE m1.organization_id IN (
        SELECT m2.organization_id FROM public.memberships m2
        WHERE m2.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Generic RLS policy function for organization-scoped tables
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply generic policies to organization-scoped tables
CREATE POLICY "Organization access" ON public.memberships FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.bank_connections FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.bank_accounts FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.categories FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.transactions FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.balance_snapshots FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.forecast_models FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.forecast_runs FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.forecast_outputs FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.scenarios FOR ALL USING (user_has_org_access(organization_id));
CREATE POLICY "Organization access" ON public.comments FOR ALL USING (user_has_org_access(organization_id));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forecast_models_updated_at BEFORE UPDATE ON public.forecast_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON public.scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo organization and sample data
INSERT INTO public.organizations (id, name, slug, base_currency) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Demo Company', 'demo-company', 'USD');

-- Insert sample categories
INSERT INTO public.categories (organization_id, name, color) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Operating Revenue', '#10B981'),
('123e4567-e89b-12d3-a456-426614174000', 'Operating Expenses', '#EF4444'),
('123e4567-e89b-12d3-a456-426614174000', 'Payroll', '#F59E0B'),
('123e4567-e89b-12d3-a456-426614174000', 'Rent', '#8B5CF6'),
('123e4567-e89b-12d3-a456-426614174000', 'Utilities', '#06B6D4'),
('123e4567-e89b-12d3-a456-426614174000', 'Other', '#6B7280');