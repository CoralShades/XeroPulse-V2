/**
 * Database Schema Types
 *
 * These types will be generated from Supabase schema.
 * For now, this is a placeholder structure.
 *
 * To generate types from Supabase:
 * npx supabase gen types typescript --project-id <project-id> > lib/types/database.types.ts
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          organization_id: string;
          active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          xero_tenant_id: string | null;
          xpm_api_key: string | null;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      // Add more tables as they are created in Story 1.3
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'executive' | 'manager' | 'staff' | 'admin';
    };
  };
}

// Helper type for easy table access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
