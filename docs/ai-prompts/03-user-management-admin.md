# XeroPulse User Management Admin Panel - Component Prompt

**Component:** Admin Panel for User CRUD Operations
**Dependencies:** Authentication system, Dashboard shell, Supabase Auth Admin API
**Estimated Time:** 4-5 hours

---

## GOAL

Build a comprehensive admin panel for managing users (create, read, update, delete) with role assignment, accessible only to executive and admin roles.

---

## VISUAL DESIGN

**Admin Panel Layout:**
```
┌────────────────────────────────────────────────────────┐
│ User Management                    [+ Add User]        │
├────────────────────────────────────────────────────────┤
│ [🔍 Search users...]  [Role Filter ▼]                  │
├────────────────────────────────────────────────────────┤
│ EMAIL               ROLE      LAST LOGIN    ACTIONS    │
│ ─────────────────────────────────────────────────────  │
│ john@example.com    Executive  Oct 15, 2:45 PM  [✏️][🗑️] │
│ jane@example.com    Manager    Oct 14, 10:12 AM [✏️][🗑️] │
│ bob@example.com     Staff      Never          [✏️][🗑️] │
│                                                         │
│ Showing 3 of 20 users                                  │
└────────────────────────────────────────────────────────┘
```

**Color Palette:**
- Executive badge: Blue (#1E3A8A background, white text)
- Manager badge: Green (#10B981 background, white text)
- Staff badge: Gray (#6B7280 background, white text)
- Delete button: Red (#DC2626)

---

## STEP-BY-STEP INSTRUCTIONS

### 1. Create Admin Panel Page (`/app/(dashboard)/admin/users/page.tsx`)

**Access Control:**
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Only executives and admins can access
  if (userData?.role !== 'executive' && userData?.role !== 'admin') {
    redirect('/forbidden')
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return <UserManagementTable users={users || []} />
}
```

### 2. Build User Management Table Component (`/components/UserManagementTable.tsx`)

**Features:**
- Display all users in table format
- Search by email
- Filter by role
- Add User button
- Edit/Delete actions per row

```tsx
'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddUserModal } from './AddUserModal'
import { EditUserModal } from './EditUserModal'
import { DeleteUserDialog } from './DeleteUserDialog'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  role: 'executive' | 'manager' | 'staff' | 'admin'
  created_at: string
  last_login: string | null
}

export function UserManagementTable({ users }: { users: User[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <Button onClick={() => setAddUserOpen(true)}>
          + Add User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    {user.last_login
                      ? formatDate(user.last_login)
                      : <span className="text-gray-400">Never</span>
                    }
                  </TableCell>
                  <TableCell>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingUser(user)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Modals */}
      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} />
      {editingUser && (
        <EditUserModal
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  )
}

// Helper component for role badges
function RoleBadge({ role }: { role: string }) {
  const colors = {
    executive: 'bg-blue-600 text-white',
    manager: 'bg-green-600 text-white',
    staff: 'bg-gray-600 text-white',
    admin: 'bg-purple-600 text-white',
  }

  return (
    <Badge className={colors[role as keyof typeof colors]}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  )
}
```

### 3. Build Add User Modal (`/components/AddUserModal.tsx`)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface AddUserModalProps {
  open: boolean
  onClose: () => void
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('staff')
  const [sendEmail, setSendEmail] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Call API route to create user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, sendEmail }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      toast({
        title: 'User created successfully',
        description: sendEmail
          ? 'An invitation email has been sent.'
          : 'User has been created.',
      })

      // Reset form and close
      setEmail('')
      setRole('staff')
      setSendEmail(true)
      onClose()

      // Refresh page to show new user
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error creating user',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with specified role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label htmlFor="sendEmail" className="text-sm font-normal">
                Send invitation email
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 4. Build Edit User Modal (`/components/EditUserModal.tsx`)

Similar to Add User, but:
- Email field is disabled (shows existing email)
- Pre-populate role with current value
- API call is PATCH instead of POST

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  role: string
}

interface EditUserModalProps {
  user: User
  open: boolean
  onClose: () => void
}

export function EditUserModal({ user, open, onClose }: EditUserModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(user.role)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      toast({
        title: 'User updated successfully',
      })

      onClose()
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error updating user',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Build Delete User Dialog (`/components/DeleteUserDialog.tsx`)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
}

interface DeleteUserDialogProps {
  user: User
  open: boolean
  onClose: () => void
}

export function DeleteUserDialog({ user, open, onClose }: DeleteUserDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast({
        title: 'User deleted successfully',
      })

      onClose()
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user.email}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 6. Create Admin API Routes

**Create User API** (`/app/api/admin/users/route.ts`)
```tsx
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  // Check if requester is admin
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: requesterData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (requesterData?.role !== 'executive' && requesterData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Create user
  const { email, role, sendEmail } = await request.json()

  // Use Supabase Admin API to create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: !sendEmail, // Skip email confirmation if not sending email
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Insert into users table with role
  await supabase.from('users').insert({
    id: data.user.id,
    email,
    role,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, user: data.user })
}
```

**Update User API** (`/app/api/admin/users/[userId]/route.ts`)
```tsx
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient()

  // Check authorization (similar to POST)
  // ...

  const { role } = await request.json()

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', params.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient()

  // Check authorization
  // ...

  // Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(params.userId)

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Delete from users table (cascade should handle this)
  await supabase.from('users').delete().eq('id', params.userId)

  return NextResponse.json({ success: true })
}
```

---

## CONSTRAINTS

### ✅ DO:
- Verify admin/executive role before allowing access
- Show confirmation dialog before deleting users
- Use toast notifications for success/error feedback
- Refresh page after user CRUD operations
- Validate email format before submission
- Show loading states during API calls

### ❌ DO NOT:
- Allow users to edit their own role
- Allow users to delete themselves
- Skip confirmation on delete operations
- Hard-code role permissions (use centralized config)
- Store passwords in users table (Supabase Auth handles this)

---

## TESTING CHECKLIST

- ✅ Only executives/admins can access admin panel
- ✅ Non-admins redirected to 403 page
- ✅ Add User creates user successfully
- ✅ Edit User updates role correctly
- ✅ Delete User removes user from system
- ✅ Search filters users by email
- ✅ Role filter shows only selected roles
- ✅ Role badges display with correct colors
- ✅ "Last Login" shows "Never" for new users
- ✅ Toast notifications appear for all operations
- ✅ Loading states show during API calls

---

## DELIVERABLES

1. Admin panel page with access control
2. User management table with search/filter
3. Add User modal with form validation
4. Edit User modal with role update
5. Delete User confirmation dialog
6. Admin API routes (create, update, delete)
7. Role badge component

**Estimated Lines of Code:** ~800-900 lines
**Key Files:** 9 files total
