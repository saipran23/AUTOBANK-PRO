-- Location: supabase/migrations/20241023111729_autobank_auth_system.sql
-- Schema Analysis: Creating fresh banking authentication schema
-- Integration Type: Complete authentication system for AutoBank Pro
-- Dependencies: auth.users (Supabase managed)

-- 1. Banking-specific User Roles
CREATE TYPE public.banking_user_role AS ENUM ('customer', 'employee', 'admin', 'manager');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'pending_verification', 'closed');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- 2. User Profiles Table (Critical intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role public.banking_user_role DEFAULT 'customer'::public.banking_user_role,
    account_status public.account_status DEFAULT 'active'::public.account_status,
    verification_status public.verification_status DEFAULT 'unverified'::public.verification_status,
    date_of_birth DATE,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'United States',
    profile_picture_url TEXT,
    employee_id TEXT UNIQUE,
    department TEXT,
    branch_location TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Banking-specific constraints
    CONSTRAINT valid_employee_id CHECK (
        (role IN ('employee', 'admin', 'manager') AND employee_id IS NOT NULL) OR 
        (role = 'customer' AND employee_id IS NULL)
    ),
    CONSTRAINT valid_department CHECK (
        (role IN ('employee', 'admin', 'manager') AND department IS NOT NULL) OR 
        (role = 'customer' AND department IS NULL)
    )
);

-- 3. Customer Banking Information
CREATE TABLE public.customer_banking_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_number TEXT UNIQUE NOT NULL,
    account_opening_date DATE DEFAULT CURRENT_DATE,
    preferred_communication TEXT DEFAULT 'email' CHECK (preferred_communication IN ('email', 'phone', 'mail')),
    monthly_income DECIMAL(15,2),
    employment_status TEXT,
    employer_name TEXT,
    credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 850),
    risk_profile TEXT DEFAULT 'medium' CHECK (risk_profile IN ('low', 'medium', 'high')),
    kyc_completed BOOLEAN DEFAULT false,
    kyc_completion_date DATE,
    two_factor_enabled BOOLEAN DEFAULT false,
    preferred_branch TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- 4. Essential Indexes for Performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_employee_id ON public.user_profiles(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_customer_banking_customer_number ON public.customer_banking_info(customer_number);
CREATE INDEX idx_customer_banking_user_id ON public.customer_banking_info(user_id);

-- 5. Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_banking_updated_at
    BEFORE UPDATE ON public.customer_banking_info
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS Setup
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_banking_info ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies using Pattern 1 (Core User Table) and Pattern 2 (Simple Ownership)

-- Pattern 1: Core user table - Simple direct access
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin access to all profiles
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Pattern 2: Simple user ownership for banking info
CREATE POLICY "users_manage_own_banking_info"
ON public.customer_banking_info
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin and employee access to customer banking info
CREATE POLICY "staff_access_customer_banking_info"
ON public.customer_banking_info
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role IN ('admin', 'employee', 'manager')
    )
);

-- 8. Automatic Profile Creation Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_role public.banking_user_role;
BEGIN
    -- Get role from metadata, default to customer
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.banking_user_role;
    
    -- Insert user profile
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role,
        employee_id,
        department
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        CASE WHEN user_role != 'customer' THEN NEW.raw_user_meta_data->>'employee_id' ELSE NULL END,
        CASE WHEN user_role != 'customer' THEN NEW.raw_user_meta_data->>'department' ELSE NULL END
    );
    
    -- Create customer banking info if role is customer
    IF user_role = 'customer' THEN
        INSERT INTO public.customer_banking_info (
            user_id,
            customer_number
        ) VALUES (
            NEW.id,
            'CUST' || LPAD((EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT, 10, '0')
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 9. Trigger for New User Creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Helper Functions for Role Management
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(up.role::TEXT, 'customer'::TEXT)
FROM public.user_profiles up
WHERE up.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_banking_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'employee', 'manager')
)
$$;

-- 11. Mock Banking Users for Development
DO $$
DECLARE
    customer_uuid UUID := gen_random_uuid();
    employee_uuid UUID := gen_random_uuid();
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure for AutoBank Pro
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'customer@autobank.com', crypt('Customer123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Customer", "role": "customer"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (employee_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'employee@autobank.com', crypt('Employee123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sarah Employee", "role": "employee", "employee_id": "EMP001", "department": "Customer Service"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@autobank.com', crypt('Admin123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Michael Admin", "role": "admin", "employee_id": "ADM001", "department": "Administration"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;