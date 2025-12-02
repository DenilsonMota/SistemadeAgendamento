import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Star,
  MapPin,
  Phone
} from 'lucide-react';

// --- MOCK DATABASE & BACKEND SERVICES ---
// Em um cenário real, estas funções fariam chamadas fetch/axios para uma API Python/Node
const DB_KEY_USERS = 'app_users';
const DB_KEY_APPOINTMENTS = 'app_appointments';

const mockBackend = {
  // Simula registro de usuário
  register: (name, email, password) => {
    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '[]');
    if (users.find(u => u.email === email)) throw new Error('E-mail já cadastrado.');
    
    const newUser = { id: Date.now(), name, email, password, role: 'client' };
    users.push(newUser);
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
    return newUser;
  },

  // Simula login
  login: (email, password) => {
    const users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '[]');
    // Usuário admin "hardcoded" para o professor testar
    if(email === 'admin@sistema.com' && password === 'admin') {
        return { id: 999, name: 'Administrador', email, role: 'admin' };
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciais inválidas.');
    return user;
  },

  // Cria agendamento
  createAppointment: (userId, service, date, time) => {
    const apps = JSON.parse(localStorage.getItem(DB_KEY_APPOINTMENTS) || '[]');
    const newApp = { 
      id: Date.now(), 
      userId, 
      service, 
      date, 
      time, 
      status: 'pending' // pending, confirmed, cancelled
    };
    apps.push(newApp);
    localStorage.setItem(DB_KEY_APPOINTMENTS, JSON.stringify(apps));
    return newApp;
  },

  // Busca agendamentos (filtra por usuário ou retorna todos se for admin)
  getAppointments: (userId, role) => {
    const apps = JSON.parse(localStorage.getItem(DB_KEY_APPOINTMENTS) || '[]');
    if (role === 'admin') return apps;
    return apps.filter(a => a.userId === userId);
  },

  // Atualiza status (cancelar ou confirmar)
  updateStatus: (appId, newStatus) => {
    let apps = JSON.parse(localStorage.getItem(DB_KEY_APPOINTMENTS) || '[]');
    apps = apps.map(a => a.id === appId ? { ...a, status: newStatus } : a);
    localStorage.setItem(DB_KEY_APPOINTMENTS, JSON.stringify(apps));
    return apps;
  }
};

// --- COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "bg-white text-teal-600 border border-teal-600 hover:bg-teal-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [view, setView] = useState('home'); // home, login, register, dashboard
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [bookingData, setBookingData] = useState({ service: 'Corte de Cabelo', date: '', time: '' });
  const [notification, setNotification] = useState(null);

  // Services Catalog
  const services = [
    { id: 1, name: 'Corte de Cabelo', price: 'R$ 50,00', duration: '45 min' },
    { id: 2, name: 'Barba & Bigode', price: 'R$ 35,00', duration: '30 min' },
    { id: 3, name: 'Limpeza de Pele', price: 'R$ 80,00', duration: '60 min' },
    { id: 4, name: 'Massagem Relaxante', price: 'R$ 120,00', duration: '50 min' },
  ];

  // Helper: Show Notification
  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- HANDLERS ---

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      const loggedUser = mockBackend.login(formData.email, formData.password);
      setUser(loggedUser);
      loadAppointments(loggedUser);
      setView('dashboard');
      showNotify(`Bem-vindo, ${loggedUser.name}!`);
    } catch (err) {
      showNotify(err.message, 'error');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    try {
      const newUser = mockBackend.register(formData.name, formData.email, formData.password);
      setUser(newUser);
      loadAppointments(newUser);
      setView('dashboard');
      showNotify('Cadastro realizado com sucesso!');
    } catch (err) {
      showNotify(err.message, 'error');
    }
  };

  const loadAppointments = (currentUser) => {
    const apps = mockBackend.getAppointments(currentUser.id, currentUser.role);
    setAppointments(apps);
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) return showNotify('Selecione data e hora', 'error');
    
    mockBackend.createAppointment(user.id, bookingData.service, bookingData.date, bookingData.time);
    loadAppointments(user);
    showNotify('Solicitação de reserva enviada!');
    setBookingData({ ...bookingData, date: '', time: '' });
  };

  const changeStatus = (id, status) => {
    mockBackend.updateStatus(id, status);
    loadAppointments(user);
    showNotify(`Agendamento ${status === 'confirmed' ? 'confirmado' : 'cancelado'}.`);
  };

  const logout = () => {
    setUser(null);
    setView('home');
    setFormData({ name: '', email: '', password: '' });
  };

  // --- VIEWS ---

  const renderNavbar = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <Scissors className="text-teal-600 w-8 h-8" />
          <span className="text-xl font-bold text-gray-800">Estética & Bem-Estar</span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:block">Olá, {user.name}</span>
              <Button variant="secondary" onClick={() => setView('dashboard')}>Meus Agendamentos</Button>
              <Button variant="outline" onClick={logout}><LogOut size={18}/></Button>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => setView('login')}>Login</Button>
              <Button variant="primary" onClick={() => setView('register')}>Cadastrar</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-teal-50 py-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Realce sua beleza, renove sua confiança.
            </h1>
            <p className="text-lg text-gray-600">
              Agende seus serviços favoritos online em segundos. Profissionais qualificados prontos para te atender.
            </p>
            <Button onClick={() => setView('register')} className="text-lg px-8 py-3">
              Agendar Agora
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <div className="relative w-80 h-96 bg-teal-200 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <img 
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Salão" 
                    className="object-cover w-full h-full"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Nossos Serviços</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {services.map(s => (
              <Card key={s.id} className="text-center hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                  <Star size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{s.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{s.duration}</p>
                <p className="text-teal-600 font-bold text-xl">{s.price}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer info */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-sm">
            <div>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Scissors size={16}/> Estética & Bem-Estar</h4>
                <p>O melhor sistema de agendamento para o seu dia a dia.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Contato</h4>
                <p className="flex items-center gap-2 mb-2"><Phone size={14}/> (11) 99999-9999</p>
                <p className="flex items-center gap-2"><MapPin size={14}/> Rua da Faculdade, 123</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Horário</h4>
                <p>Seg - Sex: 09:00 - 20:00</p>
                <p>Sáb: 09:00 - 18:00</p>
            </div>
        </div>
      </footer>
    </div>
  );

  const renderAuth = (isRegister) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isRegister ? 'Criar Conta' : 'Acesse sua Conta'}
        </h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                required
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              required
              type="email" 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              required
              type="password" 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <Button variant="primary" className="w-full mt-4">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-center">
            {isRegister ? (
                <p className="text-sm text-gray-600">Já tem conta? <span onClick={() => setView('login')} className="text-teal-600 cursor-pointer hover:underline">Faça Login</span></p>
            ) : (
                <div className="space-y-2">
                     <p className="text-sm text-gray-600">Não tem conta? <span onClick={() => setView('register')} className="text-teal-600 cursor-pointer hover:underline">Cadastre-se</span></p>
                     <p className="text-xs text-gray-400 bg-gray-100 p-2 rounded">Dica Prof: admin@sistema.com / admin</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
            {user.role === 'admin' ? 'Painel Administrativo' : 'Meus Agendamentos'}
        </h2>
        {user.role === 'admin' && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Modo Admin</span>}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Form - Only for Clients */}
        {user.role !== 'admin' && (
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="text-teal-600"/> Novo Agendamento
              </h3>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Serviço</label>
                  <select 
                    className="w-full border border-gray-300 rounded p-2"
                    value={bookingData.service}
                    onChange={e => setBookingData({...bookingData, service: e.target.value})}
                  >
                    {services.map(s => <option key={s.id} value={s.name}>{s.name} - {s.price}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded p-2"
                    value={bookingData.date}
                    onChange={e => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Horário</label>
                  <input 
                    type="time" 
                    required
                    className="w-full border border-gray-300 rounded p-2"
                    value={bookingData.time}
                    onChange={e => setBookingData({...bookingData, time: e.target.value})}
                  />
                </div>
                <Button className="w-full">Confirmar Reserva</Button>
              </form>
            </Card>
          </div>
        )}

        {/* Appointments List */}
        <div className={user.role === 'admin' ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Calendar className="mx-auto text-gray-300 mb-2 w-12 h-12" />
                <p className="text-gray-500">Nenhum agendamento encontrado.</p>
              </div>
            ) : (
              appointments.map(app => (
                <Card key={app.id} className="flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-teal-500">
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-3 rounded-full ${
                      app.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                      app.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {app.status === 'confirmed' ? <CheckCircle size={24}/> : 
                       app.status === 'cancelled' ? <XCircle size={24}/> : <Clock size={24}/>}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{app.service}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{new Date(app.date).toLocaleDateString('pt-BR')}</span> • <span>{app.time}</span>
                      </p>
                      {user.role === 'admin' && <p className="text-xs text-gray-400 mt-1">ID Cliente: {app.userId}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    {/* Actions Logic */}
                    {app.status === 'pending' && (
                        <>
                            {/* Client can cancel pending */}
                            <Button 
                                variant="danger" 
                                className="text-sm py-1 px-3" 
                                onClick={() => changeStatus(app.id, 'cancelled')}
                            >
                                Cancelar
                            </Button>
                            
                            {/* Admin can Confirm */}
                            {user.role === 'admin' && (
                                <Button 
                                    variant="primary" 
                                    className="text-sm py-1 px-3 bg-green-600 hover:bg-green-700" 
                                    onClick={() => changeStatus(app.id, 'confirmed')}
                                >
                                    Aprovar
                                </Button>
                            )}
                        </>
                    )}
                    
                    {/* Simulation Button for Clients to see flow without logging out */}
                    {user.role !== 'admin' && app.status === 'pending' && (
                         <button 
                            onClick={() => changeStatus(app.id, 'confirmed')}
                            className="text-xs text-gray-300 hover:text-gray-500 underline ml-2"
                            title="Botão de depuração para simular aprovação do admin"
                         >
                            [Simular Admin Aprova]
                         </button>
                    )}
                    
                    {app.status !== 'pending' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                             app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {app.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                        </span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl text-white animate-bounce ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-teal-600'
        }`}>
          {notification.msg}
        </div>
      )}

      {renderNavbar()}

      <main>
        {view === 'home' && renderHome()}
        {view === 'login' && renderAuth(false)}
        {view === 'register' && renderAuth(true)}
        {view === 'dashboard' && renderDashboard()}
      </main>
    </div>
  );
}