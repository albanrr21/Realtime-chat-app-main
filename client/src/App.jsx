import React, { useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { FaPaperPlane, FaEdit, FaTrash, FaCheck, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from './context/AuthContext';
import AuthScreen from './components/AuthScreen';

const socket = io(); // Connects to the same host/port by default via proxy

function App() {
  const { user, loading, logout } = useContext(AuthContext);
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState('JavaScript');
  
  // Chat State
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    // Socket Listeners
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('roomUsers', ({ users }) => {
      setUsers(users);
    });

    socket.on('typing', ({ username }) => {
      setTypingUser(username);
    });

    socket.on('stopTyping', () => {
      setTypingUser(null);
    });

    socket.on('messageDeleted', (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    socket.on('messageUpdated', ({ id, text }) => {
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, text } : msg)));
    });

    return () => {
      socket.off('message');
      socket.off('roomUsers');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('messageDeleted');
      socket.off('messageUpdated');
    };

  }, []);

  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (user && room) {
      socket.emit('joinRoom', { username: user.username, room }); // Use Auth User
      setJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputText) {
      socket.emit('chatMessage', inputText);
      setInputText('');
    }
  };

  if (loading) return <div className="text-white flex justify-center items-center h-screen">Loading...</div>;
  
  if (!user) {
    return <AuthScreen />;
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
        <form onSubmit={joinRoom} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96 border border-slate-700">
          <div className="flex justify-center mb-6">
             <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg"/>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center">Hello, {user.username}!</h1>
          <p className="text-center text-slate-400 mb-6">Select a room to join</p>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-slate-400">Room</label>
            <select
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="PHP">PHP</option>
              <option value="C#">C#</option>
              <option value="Ruby">Ruby</option>
              <option value="Java">Java</option>
            </select>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30">
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
           <h2 className="text-xl font-bold">TrimChat</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h3 className="text-xs uppercase text-slate-400 font-semibold mb-3 tracking-wider">Room Users</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700 rounded-md transition-colors">
                 <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                 <span className="text-sm font-medium">{user.username}</span>
              </li>
            ))}
          </ul>

        </div>
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors w-full font-semibold"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <h2 className="font-semibold text-lg">{room} Room</h2>
           </div>
           <button 
             onClick={() => window.location.reload()} 
             className="text-sm text-slate-400 hover:text-white transition-colors"
           >
             Leave Room
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="message-container">
          {messages.map((msg, index) => (
            <MessageBubble key={index} msg={msg} isOwn={msg.username === user.username} />
          ))}
          {/* Typing Indicator */}
          {typingUser && (
             <div className="flex items-center gap-3 animate-pulse opacity-70">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">🤖</div>
                <span className="text-sm text-slate-400 italic">{typingUser} is typing...</span>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <form onSubmit={sendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              className="flex-1 bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              placeholder="Type a message... (@bot for AI)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual message with Inline Edit
function MessageBubble({ msg, isOwn }) {
  // Just a visual display for now, actual edit logic would require socket events for update
  // User asked for "edit inside message view". 
  // We need to implement local state for editing mode.
  // Note: To persist edits, we'd need a backend event 'editMessage' which exists in server.js!

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);

  const handleEdit = () => {
    // We assume message has an 'id' property. If not, edits are hard.
    // server.js messages have 'id'.
    // send 'editMessage' { id, text }
    if (msg.id) {
       socket.emit('editMessage', { id: msg.id, text: editText });
       setIsEditing(false);
    }
  };

  // Listen for updates on parent or handle internally? 
  // Parent updates 'messages' list, so this component will re-render with new text automatically.
  
  return (
    <div className={`flex items-start gap-4 ${isOwn ? 'flex-row-reverse' : ''} group`}>
       <img src={msg.avatar} alt="chk" className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 shadow-sm" />
       
       <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="flex items-baseline gap-2 mb-1">
             <span className="text-sm font-bold text-slate-200">{msg.username}</span>
             <span className="text-xs text-slate-500">{msg.time}</span>
          </div>
          
          <div className={`relative px-4 py-3 rounded-2xl shadow-md text-sm leading-relaxed ${
             isOwn 
             ? 'bg-blue-600 text-white rounded-tr-none' 
             : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
          }`}>
             {isEditing ? (
                <div className="flex items-center gap-2">
                   <input 
                      className="bg-slate-900/50 text-white p-1 rounded outline-none border border-white/20 min-w-[200px]"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                   />
                   <button onClick={handleEdit} className="text-green-300 hover:text-green-100"><FaCheck /></button> 
                   <button onClick={() => setIsEditing(false)} className="text-red-300 hover:text-red-100"><FaTimes /></button> 
                </div>
             ) : (
                <p>{msg.text}</p>
             )}
             
             {/* Edit/Delete Actions (Only for own messages) */}
             {isOwn && !isEditing && (
                <div className="absolute -top-3 -left-3 hidden group-hover:flex gap-1 bg-slate-800 p-1 rounded-md shadow-lg border border-slate-600">
                   <button onClick={() => setIsEditing(true)} className="p-1 hover:text-blue-400 text-slate-400" title="Edit">
                      <FaEdit size={12}/>
                   </button>
                   <button onClick={() => socket.emit('deleteMessage', msg.id)} className="p-1 hover:text-red-400 text-slate-400" title="Delete">
                      <FaTrash size={12}/>
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

export default App;
