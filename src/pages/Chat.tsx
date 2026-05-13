import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import VerifiedBadge from '@/components/VerifiedBadge';

// Typing indicator dots animation
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted px-4 py-2.5 rounded-xl flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// Message tick component
function MessageTicks({ isSender, isRead }: { isSender: boolean; isRead: boolean }) {
  if (!isSender) return null;
  return isRead ? (
    <CheckCheck className="h-3.5 w-3.5 inline-block ml-1 text-primary-foreground/80" />
  ) : (
    <Check className="h-3.5 w-3.5 inline-block ml-1 text-primary-foreground/50" />
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const queryClient = useQueryClient();

  // Get accepted connections
  const { data: connections = [] } = useQuery({
    queryKey: ['chat-connections', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .eq('status', 'accepted');
      return data ?? [];
    },
    enabled: !!user,
  });

  const connectedUserIds = connections.map(c =>
    c.sender_id === user?.id ? c.receiver_id : c.sender_id
  );

  const { data: connectedProfiles = [] } = useQuery({
    queryKey: ['chat-profiles', connectedUserIds],
    queryFn: async () => {
      if (connectedUserIds.length === 0) return [];
      const { data } = await supabase.from('profiles').select('*').in('user_id', connectedUserIds);
      return data ?? [];
    },
    enabled: connectedUserIds.length > 0,
  });

  const { data: chatRoles = [] } = useQuery({
    queryKey: ['chat-roles', connectedUserIds],
    queryFn: async () => {
      if (connectedUserIds.length === 0) return [];
      const { data } = await supabase.from('user_roles').select('*').in('user_id', connectedUserIds);
      return data ?? [];
    },
    enabled: connectedUserIds.length > 0,
  });

  const getRoleForUser = (userId: string) => chatRoles.find(r => r.user_id === userId)?.role ?? null;

  // Fetch unread counts for all contacts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['unread-counts', user?.id],
    queryFn: async () => {
      if (connectedUserIds.length === 0) return {};
      const { data } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user!.id)
        .eq('read', false)
        .in('sender_id', connectedUserIds);
      const counts: Record<string, number> = {};
      (data ?? []).forEach(m => {
        counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
      });
      return counts;
    },
    enabled: connectedUserIds.length > 0,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.id, selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedUser,
  });

  // Mark messages as read when viewing
  useEffect(() => {
    if (!user || !selectedUser || messages.length === 0) return;
    const unread = messages.filter(m => m.sender_id === selectedUser && !m.read);
    if (unread.length > 0) {
      supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', selectedUser)
        .eq('receiver_id', user.id)
        .eq('read', false)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['messages', user.id, selectedUser] });
        });
    }
  }, [messages, user, selectedUser, queryClient]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!user || !selectedUser) return;
    const channel = supabase
      .channel(`chat-${[user.id, selectedUser].sort().join('-')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', user.id, selectedUser] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser, queryClient]);

  // Typing indicator via broadcast
  useEffect(() => {
    if (!user || !selectedUser) {
      setIsTyping(false);
      return;
    }
    const channelName = `typing-${[user.id, selectedUser].sort().join('-')}`;
    const channel = supabase.channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.userId === selectedUser) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();
    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [user, selectedUser]);

  // Broadcast typing event
  const broadcastTyping = useCallback(() => {
    if (typingChannelRef.current && user) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id },
      });
    }
  }, [user]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!message.trim() || !selectedUser) return;
      const { error } = await supabase.from('messages').insert({
        sender_id: user!.id,
        receiver_id: selectedUser,
        content: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const selectedProfile = connectedProfiles.find(p => p.user_id === selectedUser);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    broadcastTyping();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Contacts */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Contacts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            {connectedProfiles.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No connections yet. Connect with people from the directory to start chatting.
              </div>
            ) : (
              connectedProfiles.map(p => {
                const initials = p.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const unread = unreadCounts[p.user_id] || 0;
                return (
                  <button
                    key={p.user_id}
                    onClick={() => setSelectedUser(p.user_id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                      selectedUser === p.user_id ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-semibold' : 'font-medium'}`}>{p.full_name}</p>
                        <VerifiedBadge role={getRoleForUser(p.user_id)} studentBadge={(p as any).student_badge} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{p.position || p.department || ''}</p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedUser && selectedProfile ? (
            <>
              <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {selectedProfile.avatar_url ? <AvatarImage src={selectedProfile.avatar_url} alt={selectedProfile.full_name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selectedProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-sm">{selectedProfile.full_name}</CardTitle>
                      <VerifiedBadge role={getRoleForUser(selectedProfile.user_id)} studentBadge={(selectedProfile as any).student_badge} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isTyping ? (
                        <span className="text-primary animate-pulse">typing...</span>
                      ) : (
                        <>{selectedProfile.position}{selectedProfile.company ? ` at ${selectedProfile.company}` : ''}</>
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => {
                  const isSender = m.sender_id === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                    >
                      <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {m.content}
                        <div className={`flex items-center justify-end gap-0.5 mt-1 ${isSender ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          <span className="text-[10px]">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <MessageTicks isSender={isSender} isRead={m.read ?? false} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEnd} />
              </CardContent>
              <div className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage.mutate())}
                />
                <Button size="icon" onClick={() => sendMessage.mutate()} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
