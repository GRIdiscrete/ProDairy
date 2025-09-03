"use client"

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/store'
import { usePathname } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/layout/admin-dashboard-layout'
import { DataCaptureDashboardLayout } from '@/components/layout/data-capture-dashboard-layout'
import { DriversDashboardLayout } from '@/components/layout/drivers-dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Shield, 
  Activity, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { ProfilePulseLoading } from '@/components/ui/pulse-loading'
import { EditProfileDrawer } from '@/components/forms/edit-profile-drawer'

export default function ProfilePage() {
  const { user, profile, isAuthenticated } = useAppSelector((state) => state.auth)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Determine which layout to use based on pathname
  const getDashboardLayout = () => {
    if (pathname.startsWith('/admin')) {
      return 'admin'
    } else if (pathname.startsWith('/drivers')) {
      return 'drivers'
    } else if (pathname.startsWith('/data-capture')) {
      return 'data-capture'
    }
    return 'admin' // Default
  }

  const dashboardLayout = getDashboardLayout()

  if (!isClient) {
    return <ProfilePulseLoading />
  }

  if (!isAuthenticated || !profile) {
    return <ProfilePulseLoading />
  }

  // Mock recent activities - in real app, this would come from API
  const recentActivities = [
    {
      id: 1,
      action: 'Updated production plan',
      description: 'Modified Q4 production schedule for dairy products',
      timestamp: '2 hours ago',
      type: 'update',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Reviewed quality report',
      description: 'Approved batch #2024-001 quality assessment',
      timestamp: '1 day ago',
      type: 'review',
      status: 'completed'
    },
    {
      id: 3,
      action: 'Created new user account',
      description: 'Added operator John Doe to production team',
      timestamp: '3 days ago',
      type: 'create',
      status: 'completed'
    },
    {
      id: 4,
      action: 'Maintenance scheduled',
      description: 'Scheduled routine maintenance for Machine A-12',
      timestamp: '1 week ago',
      type: 'schedule',
      status: 'pending'
    }
  ]

  // Mock roles and permissions - in real app, this would come from API
  const userRole = {
    name: 'Production Manager',
    description: 'Manages production operations and team coordination',
    permissions: [
      { category: 'Production', permissions: ['view', 'create', 'edit', 'delete'] },
      { category: 'Users', permissions: ['view', 'create', 'edit'] },
      { category: 'Reports', permissions: ['view', 'export'] },
      { category: 'Maintenance', permissions: ['view', 'schedule'] },
      { category: 'Quality', permissions: ['view', 'approve', 'reject'] }
    ]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update': return <Edit3 className="h-4 w-4 text-blue-500" />
      case 'review': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'create': return <User className="h-4 w-4 text-purple-500" />
      case 'schedule': return <Clock className="h-4 w-4 text-orange-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const profileContent = (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 ring-2 ring-blue-100">
                <AvatarImage src={user?.avatar || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {userRole.name}
                </CardDescription>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{profile.department}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900">{recentActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userRole.permissions.reduce((acc, cat) => acc + cat.permissions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(profile.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Recent Activities</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile Info</span>
          </TabsTrigger>
        </TabsList>

        {/* Recent Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription>
                Your latest actions and system interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          {getStatusBadge(activity.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Role & Permissions</span>
              </CardTitle>
              <CardDescription>
                Your current role and associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Current Role</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {userRole.name}
                  </Badge>
                  <span className="text-sm text-gray-600">{userRole.description}</span>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Permissions by Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userRole.permissions.map((category, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">{category.category}</h5>
                      <div className="flex flex-wrap gap-2">
                        {category.permissions.map((permission, permIndex) => (
                          <Badge 
                            key={permIndex} 
                            variant="secondary" 
                            className="text-xs bg-green-100 text-green-800"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Your personal and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                        <p className="text-sm text-gray-600">{profile.first_name} {profile.last_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Department</p>
                        <p className="text-sm text-gray-600">{profile.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Role ID</p>
                        <p className="text-sm text-gray-600">{profile.role_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-sm text-gray-600">
                          {profile.updated_at 
                            ? new Date(profile.updated_at).toLocaleDateString() 
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        profile={profile}
        user={user}
      />
    </div>
  )

  // Render with appropriate dashboard layout
  switch (dashboardLayout) {
    case 'admin':
      return (
        <AdminDashboardLayout title="Profile" subtitle="Your personal profile and settings">
          {profileContent}
        </AdminDashboardLayout>
      )
    case 'drivers':
      return (
        <DriversDashboardLayout title="Profile" subtitle="Your personal profile and settings">
          {profileContent}
        </DriversDashboardLayout>
      )
    case 'data-capture':
      return (
        <DataCaptureDashboardLayout title="Profile" subtitle="Your personal profile and settings">
          {profileContent}
        </DataCaptureDashboardLayout>
      )
    default:
      return (
        <AdminDashboardLayout title="Profile" subtitle="Your personal profile and settings">
          {profileContent}
        </AdminDashboardLayout>
      )
  }
}
