import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AuthScreen = () => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
        return setError('Password must be at least 6 characters');
    }

    const res = isLogin 
        ? await login(username, password) 
        : await register(username, password);

    if (!res.success) {
        setError(res.msg);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96 border border-slate-700">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-center text-slate-400 mb-6 text-sm">
            {isLogin ? 'Login to continue chatting' : 'Get your own identity forever'}
        </p>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-400">Username</label>
            <input
              type="text"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-400">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-400 hover:text-blue-300 font-semibold"
            >
                {isLogin ? 'Register' : 'Login'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
