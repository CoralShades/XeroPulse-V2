# Database Schema

### Overview

XeroPulse uses Supabase PostgreSQL as the primary data store with a schema optimized for financial analytics, user management, and audit trails. The design balances normalized data integrity with denormalized performance for dashboard queries while maintaining ACID compliance and data consistency.

### Core Tables Schema

**Users & Authentication**

```sql
-- Users table with role-based access control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('executive', 'manager', 'staff', 'admin')),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deactivated_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role CHECK (role IN ('executive', 'manager', 'staff', 'admin'))
);

-- Organizations for multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    xero_tenant_id VARCHAR(100) UNIQUE,
    xpm_api_key VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- API connection status
    xero_connected BOOLEAN DEFAULT false,
    xpm_connected BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_subscription CHECK (subscription_status IN ('active', 'suspended', 'cancelled'))
);

-- User sessions for audit and security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    
    -- Indexes for performance
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_expires (expires_at)
);
```

**Financial Data Tables**

```sql
-- Unified financial transactions from Xero
CREATE TABLE financial_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Core financial data
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    transaction_date DATE NOT NULL,
    due_date DATE,
    
    -- Client/Contact information
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(255),
    
    -- Categorization
    account_code VARCHAR(20),
    account_name VARCHAR(255),
    description TEXT,
    reference VARCHAR(255),
    
    -- Status and metadata
    status VARCHAR(20) NOT NULL,
    source VARCHAR(10) NOT NULL CHECK (source IN ('xero', 'xpm', 'manual')),
    source_id VARCHAR(100) NOT NULL,
    
    -- JSON metadata for source-specific fields
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Composite unique constraint
    UNIQUE(organization_id, source, source_id),
    
    -- Indexes for dashboard queries
    INDEX idx_financial_org_date (organization_id, transaction_date),
    INDEX idx_financial_type_status (transaction_type, status),
    INDEX idx_financial_client (client_id),
    INDEX idx_financial_account (account_code),
    INDEX idx_financial_source (source, source_id)
);

-- Project/Job data from XPM
CREATE TABLE project_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Project information
    project_id VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(255),
    
    -- Time tracking data
    user_id UUID REFERENCES users(id),
    staff_name VARCHAR(255),
    hours DECIMAL(8,2) NOT NULL,
    billable_rate DECIMAL(10,2),
    cost_rate DECIMAL(10,2),
    
    -- Task details
    task_type VARCHAR(100),
    description TEXT,
    work_date DATE NOT NULL,
    billable BOOLEAN DEFAULT true,
    billed BOOLEAN DEFAULT false,
    
    -- Project status
    project_status VARCHAR(20),
    budget_amount DECIMAL(15,2),
    budget_hours DECIMAL(8,2),
    
    -- Source metadata
    source VARCHAR(10) DEFAULT 'xpm',
    source_id VARCHAR(100) NOT NULL,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(organization_id, source, source_id),
    
    -- Indexes for WIP and project reporting
    INDEX idx_project_org_date (organization_id, work_date),
    INDEX idx_project_client (client_id),
    INDEX idx_project_user (user_id),
    INDEX idx_project_status (project_status),
    INDEX idx_project_billable (billable, billed)
);

-- Client/Contact master data
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Client information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Australia',
    
    -- Business information
    abn VARCHAR(15),
    industry VARCHAR(100),
    client_type VARCHAR(20) DEFAULT 'customer',
    
    -- Financial settings
    credit_limit DECIMAL(15,2),
    payment_terms INTEGER DEFAULT 30,
    default_tax_rate DECIMAL(5,2),
    
    -- Status and flags
    active BOOLEAN DEFAULT true,
    is_individual BOOLEAN DEFAULT false,
    
    -- Source data reconciliation
    xero_contact_id VARCHAR(100),
    xpm_client_id VARCHAR(100),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexes
    INDEX idx_clients_org (organization_id),
    INDEX idx_clients_xero (xero_contact_id),
    INDEX idx_clients_xpm (xmp_client_id),
    INDEX idx_clients_active (active)
);
```

**Dashboard & Access Control**

```sql
-- Dashboard access tracking
CREATE TABLE dashboard_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    dashboard_id VARCHAR(50) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Access details
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    session_duration INTERVAL,
    ip_address INET,
    user_agent TEXT,
    
    -- Dashboard metadata
    dashboard_name VARCHAR(255),
    embed_url TEXT,
    
    -- Indexes for analytics
    INDEX idx_access_user_date (user_id, accessed_at),
    INDEX idx_access_dashboard (dashboard_id),
    INDEX idx_access_org_date (organization_id, accessed_at)
);

-- Dashboard configurations
CREATE TABLE dashboard_configs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metabase_dashboard_id INTEGER NOT NULL,
    
    -- Access control
    required_role VARCHAR(20) NOT NULL,
    organization_scoped BOOLEAN DEFAULT true,
    
    -- Performance settings
    refresh_interval_minutes INTEGER DEFAULT 120,
    cache_duration_minutes INTEGER DEFAULT 60,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(50),
    color VARCHAR(7),
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User dashboard preferences
CREATE TABLE user_dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    dashboard_id VARCHAR(50) NOT NULL REFERENCES dashboard_configs(id),
    
    -- Preferences
    is_favorite BOOLEAN DEFAULT false,
    custom_filters JSONB,
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    
    -- Constraints
    UNIQUE(user_id, dashboard_id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Sync & Audit Tables**

```sql
-- Data synchronization tracking
CREATE TABLE sync_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Sync details
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('scheduled', 'webhook', 'manual')),
    trigger_source VARCHAR(20) NOT NULL CHECK (trigger_source IN ('xero', 'xpm', 'admin')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and results
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    duration_seconds INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexes
    INDEX idx_sync_org_status (organization_id, status),
    INDEX idx_sync_started (started_at),
    INDEX idx_sync_type (sync_type)
);

-- Detailed sync logs for debugging
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_session_id UUID NOT NULL REFERENCES sync_sessions(id) ON DELETE CASCADE,
    
    -- Log details
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    
    -- Context
    source_system VARCHAR(10),
    operation VARCHAR(50),
    record_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexes
    INDEX idx_logs_session (sync_session_id),
    INDEX idx_logs_level_time (log_level, created_at),
    INDEX idx_logs_source (source_system)
);

-- Admin actions audit trail
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Action details
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    
    -- Action data
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexes
    INDEX idx_admin_actions_user (admin_user_id),
    INDEX idx_admin_actions_time (created_at),
    INDEX idx_admin_actions_type (action_type)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_access ENABLE ROW LEVEL SECURITY;

-- Users can only see users in their organization
CREATE POLICY users_organization_isolation ON users
    FOR ALL USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Admins can manage users in their organization
CREATE POLICY users_admin_management ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.organization_id = users.organization_id
            AND u.role IN ('admin', 'executive')
        )
    );

-- Financial data scoped to organization
CREATE POLICY financial_data_organization ON financial_data
    FOR ALL USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Staff users see limited financial data based on assigned clients
CREATE POLICY financial_data_staff_restriction ON financial_data
    FOR SELECT USING (
        CASE 
            WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'staff' THEN
                client_id IN (
                    SELECT client_id FROM user_client_assignments 
                    WHERE user_id = auth.uid()
                )
            ELSE true
        END
    );

-- Project data organization scoping
CREATE POLICY project_data_organization ON project_data
    FOR ALL USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Staff users see only their own time entries
CREATE POLICY project_data_staff_restriction ON project_data
    FOR SELECT USING (
        CASE 
            WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'staff' THEN
                user_id = auth.uid()
            ELSE true
        END
    );

-- Dashboard access logging
CREATE POLICY dashboard_access_organization ON dashboard_access
    FOR ALL USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );
```

### Indexes for Performance

```sql
-- Composite indexes for common dashboard queries
CREATE INDEX idx_financial_dashboard_summary ON financial_data 
    (organization_id, transaction_type, transaction_date DESC) 
    WHERE status = 'AUTHORISED';

CREATE INDEX idx_financial_ar_aging ON financial_data 
    (organization_id, client_id, due_date) 
    WHERE transaction_type = 'revenue' AND status IN ('AUTHORISED', 'PAID');

CREATE INDEX idx_project_wip_analysis ON project_data 
    (organization_id, project_status, billable, billed) 
    WHERE project_status IN ('INPROGRESS', 'ONHOLD');

CREATE INDEX idx_project_time_summary ON project_data 
    (organization_id, work_date DESC, billable) 
    WHERE hours > 0;

-- Covering indexes for user authentication
CREATE INDEX idx_users_auth_lookup ON users 
    (email, organization_id) 
    INCLUDE (id, role, active, last_login);

-- Partial indexes for active records
CREATE INDEX idx_clients_active_org ON clients 
    (organization_id, name) 
    WHERE active = true;

CREATE INDEX idx_sync_recent_sessions ON sync_sessions 
    (organization_id, started_at DESC) 
    WHERE started_at > now() - INTERVAL '30 days';
```

### Database Functions & Triggers

```sql
-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_data_updated_at 
    BEFORE UPDATE ON financial_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_data_updated_at 
    BEFORE UPDATE ON project_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate AR aging buckets
CREATE OR REPLACE FUNCTION calculate_ar_aging(due_date DATE)
RETURNS TEXT AS $$
BEGIN
    CASE 
        WHEN due_date >= CURRENT_DATE THEN RETURN 'Current'
        WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN RETURN '1-30 days'
        WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN RETURN '31-60 days'
        WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN RETURN '61-90 days'
        ELSE RETURN '90+ days'
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for dashboard data aggregation
CREATE OR REPLACE FUNCTION get_monthly_revenue_summary(
    org_id UUID, 
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '12 months'
)
RETURNS TABLE (
    month DATE,
    revenue DECIMAL(15,2),
    expenses DECIMAL(15,2),
    net_profit DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', fd.transaction_date)::DATE as month,
        COALESCE(SUM(CASE WHEN fd.transaction_type = 'revenue' THEN fd.amount END), 0) as revenue,
        COALESCE(SUM(CASE WHEN fd.transaction_type = 'expense' THEN fd.amount END), 0) as expenses,
        COALESCE(SUM(CASE WHEN fd.transaction_type = 'revenue' THEN fd.amount END), 0) - 
        COALESCE(SUM(CASE WHEN fd.transaction_type = 'expense' THEN fd.amount END), 0) as net_profit
    FROM financial_data fd
    WHERE fd.organization_id = org_id
    AND fd.transaction_date >= start_date
    AND fd.status = 'AUTHORISED'
    GROUP BY DATE_TRUNC('month', fd.transaction_date)
    ORDER BY month;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Data Retention & Archival

```sql
-- Partition sync_logs table by month for efficient archival
CREATE TABLE sync_logs_y2025m10 PARTITION OF sync_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Function to clean old session data
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < now() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old sync logs
CREATE OR REPLACE FUNCTION archive_old_sync_logs()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Archive logs older than 6 months to separate table
    INSERT INTO sync_logs_archive 
    SELECT * FROM sync_logs 
    WHERE created_at < now() - INTERVAL '6 months';
    
    DELETE FROM sync_logs 
    WHERE created_at < now() - INTERVAL '6 months';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

### Detailed Rationale

**Schema Design Philosophy**: Balanced approach between normalization for data integrity and selective denormalization for dashboard performance. Financial and project data include client_name fields to avoid joins in reporting queries while maintaining referential integrity through client_id foreign keys.

**Multi-Tenancy Strategy**: Organization-scoped isolation using RLS policies ensures complete data separation between organizations without requiring separate databases. This simplifies deployment while maintaining security and compliance requirements.

**Audit Trail Design**: Comprehensive logging of user actions, data synchronization, and system events enables compliance reporting and troubleshooting. JSON metadata fields provide flexibility for source system-specific data without schema changes.

**Performance Optimization**: Strategic indexing focuses on dashboard query patterns (date ranges, status filters, organization scoping). Partial indexes reduce storage overhead for inactive records while maintaining query performance.

**Data Integrity Approach**: Foreign key constraints ensure referential integrity while CHECK constraints validate enum values and business rules. Triggers handle automatic timestamp updates consistently across tables.

**Security Model**: RLS policies enforce organization-level isolation and role-based data access. Staff users see only assigned clients and their own time entries, while managers and executives have broader access within their organization.

**Key Assumptions**: PostgreSQL performance characteristics scale to expected data volumes (millions of financial transactions, thousands of users). Supabase RLS overhead remains acceptable for dashboard query performance. JSON metadata fields provide sufficient flexibility for source system variations.

**Validation Needs**: Load testing with realistic data volumes to validate index performance. Security testing of RLS policies with various user roles and edge cases. Backup and recovery testing for compliance requirements.

---
