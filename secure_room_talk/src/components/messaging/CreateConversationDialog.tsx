import { useState } from 'react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserSearch } from './UserSearch';
import api from '@/lib/api';

interface CreateConversationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export const CreateConversationDialog = ({ open, onOpenChange, onConversationCreated }: CreateConversationDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { createConversation } = useRealTimeMessages();
  const { toast } = useToast();
  const [type, setType] = useState<'direct' | 'group'>('direct');

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleCreate = async () => {
    if (type === 'group' && !title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }
    // For direct, only allow exactly one user to be selected (besides the logged-in user)
    if (type === 'direct') {
      if (selectedUsers.length !== 1) {
        toast({
          title: "Error",
          description: "Select exactly one user for a direct message",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (selectedUsers.length < 2) {
        toast({
          title: "Error",
          description: "Select at least 2 participants for a group",
          variant: "destructive"
        });
        return;
      }
    }
    // Always include the logged-in user in the participants array
    const loggedInUserId = localStorage.getItem('userId');
    let participants = [...selectedUsers];
    if (loggedInUserId && !participants.includes(loggedInUserId)) {
      participants.push(loggedInUserId);
    }
    try {
      setLoading(true);
      const payload = {
        participants,
        type,
        name: type === 'group' ? title : undefined
      };
      const conversationId = await createConversation(
        participants,
        type === 'group' ? title : undefined,
        type
      );
      setIsOpen(false);
      setTitle('');
      setSelectedUsers([]);
      onConversationCreated?.(conversationId);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>New Conversation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Conversation</DialogTitle>
          <DialogDescription>
            Create a new conversation with one or more participants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <Label>Type:</Label>
            <Button
              type="button"
              variant={type === 'direct' ? 'default' : 'outline'}
              onClick={() => setType('direct')}
              className={type === 'direct' ? '' : 'bg-transparent'}
            >
              Direct
            </Button>
            <Button
              type="button"
              variant={type === 'group' ? 'default' : 'outline'}
              onClick={() => setType('group')}
              className={type === 'group' ? '' : 'bg-transparent'}
            >
              Group
            </Button>
          </div>
          {type === 'group' && (
            <div>
              <Label htmlFor="title">Group Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
          )}
          <UserSearch selectedUsers={selectedUsers} onUsersChange={setSelectedUsers} />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
