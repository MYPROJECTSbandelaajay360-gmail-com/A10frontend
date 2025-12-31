'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Clock, CheckCircle, XCircle, LogOut, Settings, Edit2, Save, BarChart3, ChevronRight, Bell, Shield, Mail, Check, Zap, X as CloseIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  content: string;
  sender: 'customer' | 'agent' | 'system';
  timestamp: string;
}

interface ChatSession {
  id: number;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'active' | 'closed';
  created_at: string;
}

interface QuickReply {
  id: number;
  category: string;
  text: string;
  icon: string;
}

type View = 'chat' | 'profile' | 'settings';

export default function AgentDashboard() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [pendingChats, setPendingChats] = useState<ChatSession[]>([]);
  const [activeChats, setActiveChats] = useState<ChatSession[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [agentUsername, setAgentUsername] = useState<string>('');
  const [agentEmail, setAgentEmail] = useState<string>('');
  
  // New State for Features
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Quick Replies
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  
  // Close Ticket Dialog
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  
  // Mock Stats
  const [stats] = useState({
    casesClosed: 142,
    rating: 4.8,
    responseTime: '1m 30s',
    onlineHours: '24h'
  });

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setAgentUsername(user.name || user.email);
    setAgentEmail(user.email);
    setNewName(user.name || user.email);
    
    console.log('[Agent Dashboard] Connecting to WebSocket...');
    console.log('[Agent Dashboard] User email:', user.email);

    // Fetch quick replies
    fetch('http://localhost:8000/api/agent/quick-replies')
      .then(res => res.json())
      .then(data => setQuickReplies(data.quick_replies))
      .catch(err => console.error('Failed to load quick replies:', err));

    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/agent/${user.email}`);

    ws.onopen = () => {
      console.log('[Agent Dashboard] WebSocket connected successfully');
      setIsConnected(true);
    };
    
    ws.onerror = (error) => {
      console.error('[Agent Dashboard] WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log('[Agent Dashboard] Received message:', data);

      if (data.type === 'dashboard_update') {
        setPendingChats(data.pending);
        setActiveChats(data.active);
      } else if (data.type === 'pending_chats') {
        setPendingChats(data.data);
      } else if (data.type === 'message') {
        const { session_id, content, sender, timestamp } = data;
        setMessages(prev => ({
          ...prev,
          [session_id]: [...(prev[session_id] || []), {
            content,
            sender,
            timestamp
          }]
        }));
      } else if (data.type === 'history') {
          const { session_id, messages } = data;
          setMessages(prev => ({
              ...prev,
              [session_id]: messages
          }));
      } else if (data.type === 'session_closed') {
        // Handle session closure notification
        const { session_id, message: closeMsg } = data;
        setMessages(prev => ({
          ...prev,
          [session_id]: [...(prev[session_id] || []), {
            content: closeMsg,
            sender: 'system',
            timestamp: new Date().toISOString()
          }]
        }));
        // Remove from active chats
        setActiveChats(prev => prev.filter(c => c.id !== session_id));
      }
    };

    ws.onclose = () => {
      console.log('Agent disconnected');
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [router]);

  useEffect(() => {
    if (selectedSessionId && messages[selectedSessionId]) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedSessionId]);

  const handleJoinChat = (sessionId: number) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'join_chat',
        session_id: sessionId
      }));
      setSelectedSessionId(sessionId);
      // Optimistic update
      const session = pendingChats.find(c => c.id === sessionId);
      if (session) {
        setPendingChats(prev => prev.filter(c => c.id !== sessionId));
        setActiveChats(prev => [...prev, { ...session, status: 'active' }]);
      }
      setCurrentView('chat');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSessionId || !socket) return;

    socket.send(JSON.stringify({
      type: 'message',
      session_id: selectedSessionId,
      content: inputMessage
    }));
    
    // Optimistic update
    setMessages(prev => ({
        ...prev,
        [selectedSessionId]: [...(prev[selectedSessionId] || []), {
            content: inputMessage,
            sender: 'agent',
            timestamp: new Date().toISOString()
        }]
    }));

    setInputMessage('');
  };

  const handleUpdateName = () => {
    // In a real app, this would make an API call
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.name = newName;
      localStorage.setItem('user', JSON.stringify(user));
      setAgentUsername(newName);
      setIsEditingName(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedSessionId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${selectedSessionId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution_note: resolutionNote }),
      });
      
      if (response.ok) {
        // Add system message locally
        setMessages(prev => ({
          ...prev,
          [selectedSessionId]: [...(prev[selectedSessionId] || []), {
            content: 'Ticket closed and resolved. Thank you for contacting support!',
            sender: 'system',
            timestamp: new Date().toISOString()
          }]
        }));
        
        // Remove from active chats
        setActiveChats(prev => prev.filter(c => c.id !== selectedSessionId));
        setSelectedSessionId(null);
        setShowCloseDialog(false);
        setResolutionNote('');
      }
    } catch (error) {
      console.error('Failed to close ticket:', error);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputMessage(text);
    setShowQuickReplies(false);
  };

  const renderSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-3 shadow-lg shadow-blue-200">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-lg">Agent Portal</h2>
            <div className="flex items-center mt-1">
              <span className="relative flex h-2.5 w-2.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-600 truncate">{agentUsername}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-blue-100 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">Pending</div>
            <div className="text-xl font-bold text-blue-600">{pendingChats.length}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-green-100 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">Active</div>
            <div className="text-xl font-bold text-green-600">{activeChats.length}</div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <button
          onClick={() => setCurrentView('chat')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            currentView === 'chat' 
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-200' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Conversations</span>
        </button>
        <button
          onClick={() => setCurrentView('profile')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            currentView === 'profile' 
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-200' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            currentView === 'settings' 
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-200' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {currentView === 'chat' && (
          <>
            {pendingChats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Waiting Queue</h3>
                <div className="space-y-2">
                  {pendingChats.map(chat => (
                    <div key={chat.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{chat.customer_name}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          {new Date(chat.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinChat(chat.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>Accept Chat</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Active Chats</h3>
              <div className="space-y-2">
                {activeChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedSessionId(chat.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all group ${
                      selectedSessionId === chat.id
                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium text-sm ${selectedSessionId === chat.id ? 'text-blue-700' : 'text-gray-900'}`}>
                        {chat.customer_name}
                      </span>
                      {selectedSessionId === chat.id && <span className="w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-200"></span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{chat.customer_email}</p>
                  </button>
                ))}
                {activeChats.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No active conversations</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="flex items-center justify-center w-full text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all text-sm font-medium group"
        >
          <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg inline-block">
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <User className="h-10 w-10" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button onClick={handleUpdateName} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                      <Save className="h-4 w-4" />
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    {agentUsername}
                    <button onClick={() => setIsEditingName(true)} className="ml-3 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </h1>
                )}
                <p className="text-gray-500">{agentEmail}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Senior Agent
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-gray-500 text-sm mb-1">Cases Closed</div>
                <div className="text-2xl font-bold text-gray-900">{stats.casesClosed}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-gray-500 text-sm mb-1">Rating</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center">
                  {stats.rating}
                  <span className="text-yellow-400 ml-1 text-lg">★</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-gray-500 text-sm mb-1">Response Time</div>
                <div className="text-2xl font-bold text-gray-900">{stats.responseTime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts for new messages</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Privacy Mode</h3>
                <p className="text-sm text-gray-500">Hide sensitive customer data</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Digest</h3>
                <p className="text-sm text-gray-500">Daily summary of your performance</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden fixed inset-0 z-50">
      {renderSidebar()}

      {currentView === 'chat' ? (
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          {selectedSessionId ? (
            <>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                    {activeChats.find(c => c.id === selectedSessionId)?.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {activeChats.find(c => c.id === selectedSessionId)?.customer_name || 'Unknown Customer'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Quick Replies"
                  >
                    <Zap className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setShowCloseDialog(true)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Close Ticket"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth">
                {(messages[selectedSessionId] || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === 'agent' ? 'justify-end' : 
                      msg.sender === 'system' ? 'justify-center' : 'justify-start'
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    {msg.sender === 'system' ? (
                      <span className="bg-gray-200/80 backdrop-blur-sm text-gray-600 text-xs px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
                        {msg.content}
                      </span>
                    ) : (
                      <div className={`flex flex-col max-w-[70%] ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-5 py-3 shadow-sm ${
                            msg.sender === 'agent'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1.5 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Quick Replies Panel */}
                {showQuickReplies && (
                  <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200 max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-purple-900 flex items-center">
                        <Zap className="h-4 w-4 mr-1.5" />
                        Quick Replies
                      </h4>
                      <button 
                        onClick={() => setShowQuickReplies(false)}
                        className="text-purple-400 hover:text-purple-600"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {(quickReplies || []).map(reply => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply.text)}
                          className="text-left p-2 bg-white hover:bg-purple-100 rounded-lg transition-colors text-sm flex items-start space-x-2 border border-purple-100"
                        >
                          <span className="text-lg">{reply.icon}</span>
                          <div className="flex-1">
                            <div className="text-xs text-purple-600 font-medium">{reply.category}</div>
                            <div className="text-gray-700">{reply.text}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
              
              {/* Close Ticket Dialog */}
              {showCloseDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                        Close Ticket
                      </h3>
                      <button 
                        onClick={() => setShowCloseDialog(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <CloseIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to close this ticket? This will mark the issue as resolved.
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Notes (Optional)
                      </label>
                      <textarea
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="Add any notes about how this issue was resolved..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCloseDialog(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCloseTicket}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Close Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome back, {agentUsername.split(' ')[0]}!</h3>
              <p className="text-gray-500 max-w-sm text-center">Select a conversation from the sidebar to start chatting with customers.</p>
            </div>
          )}
        </div>
      ) : currentView === 'profile' ? (
        renderProfile()
      ) : (
        renderSettings()
      )}
    </div>
  );
}
