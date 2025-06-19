import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface UserSearchProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
}

export const UserSearch = ({ selectedUsers, onUsersChange }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const users = await api.profile.search(query);
      setSearchResults(users);
    } catch (err) {
      console.error('Error searching users:', err);
      toast({
        title: "Error searching users",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchUsers(value);
  };

  const toggleUserSelection = (user: User) => {
    onUsersChange(
      selectedUsers.includes(user.id)
        ? selectedUsers.filter(id => id !== user.id)
        : [...selectedUsers, user.id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No users found</div>
          ) : (
            searchResults.map((user, index) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <div
                  key={user.id || user.username || index}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.full_name?.charAt(0) || user.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
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
            {searchResults
              .filter(user => selectedUsers.includes(user.id))
              .map((user, index) => (
                <Badge
                  key={user.id || user.username || index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleUserSelection(user)}
                >
                  {user.full_name || user.username} ×
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}; 