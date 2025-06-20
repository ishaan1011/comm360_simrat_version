import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
}

interface UserSearchProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
}

export const UserSearch = ({ selectedUsers, onUsersChange }: UserSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const users = await api.profile.search(e.target.value);
      setResults(Array.isArray(users) ? users : []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const toggleUserSelection = (user: User) => {
    onUsersChange(
      selectedUsers.includes(user._id)
        ? selectedUsers.filter(id => id !== user._id)
        : [...selectedUsers, user._id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={query}
          onChange={handleChange}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {query && (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No users found</div>
          ) : (
            results.map((user, index) => {
              const isSelected = selectedUsers.includes(user._id);
              return (
                <div
                  key={user._id || user.username || index}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || '/default-avatar.png'} />
                    <AvatarFallback className="text-xs">
                      {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.full_name ? `${user.full_name} (${user.username})` : user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div>
          <Label>Selected Users</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {results
              .filter(user => selectedUsers.includes(user._id))
              .map((user, index) => (
                <Badge
                  key={user._id || user.username || index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleUserSelection(user)}
                >
                  {user.full_name ? `${user.full_name} (${user.username})` : user.username} ×
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}; 