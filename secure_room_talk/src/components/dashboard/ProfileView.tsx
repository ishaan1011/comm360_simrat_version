
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Settings, LogOut, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ProfileViewProps {
  currentUser: User;
  onLogout: () => void;
}

export const ProfileView = ({ currentUser }: ProfileViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedEmail, setEditedEmail] = useState(currentUser.email);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSave = () => {
    // In a real app, this would update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(currentUser.name);
    setEditedEmail(currentUser.email);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const stats = [
    { label: 'Meetings Hosted', value: '24' },
    { label: 'Messages Sent', value: '1,247' },
    { label: 'Active Groups', value: '8' },
  ];

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account settings</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                        <Input
                          id="name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold text-white">{currentUser.name}</h3>
                      <p className="text-slate-400 flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {currentUser.email}
                      </p>
                      <Badge className="mt-3 bg-green-500 text-white">
                        Active
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-slate-700 rounded-lg">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Settings & Actions */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-white hover:bg-slate-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-white hover:bg-slate-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account Type</span>
                  <Badge className="bg-blue-500 text-white">Premium</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Member Since</span>
                  <span className="text-white">Jan 2024</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Active</span>
                  <span className="text-white">Now</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
