/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Users, 
  Calendar, 
  MapPin, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  Download, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Registration, ADMIN_TOKEN } from './types';

export default function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const registrationRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchRegistrations();
      fetchStats();
    }
  }, [isAdminLoggedIn]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/registrations', {
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      });
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowSuccess(true);
        // WhatsApp redirection
        const message = `Olá ${data.name}, a sua inscrição no 1º Workshop de Radiologia do ITSK organizado pela ☢️GER foi realizada com sucesso.\nEm breve enviaremos mais informações sobre o evento.`;
        const encodedMsg = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${(data.whatsapp as string).replace(/\D/g, '')}?text=${encodedMsg}`;
        
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'oger2026') {
      setIsAdminLoggedIn(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'WhatsApp', 'Instituição', 'Curso', 'Ano', 'Data'];
    const rows = registrations.map(r => [
      r.name, r.email, r.whatsapp, r.institution, r.course, r.year, new Date(r.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inscritos_workshop_oger.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        {!isAdminLoggedIn ? (
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md p-8 bg-zinc-900 border border-gold/20 rounded-2xl shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                  <Radio className="text-gold w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-center mb-6">Painel Administrativo ☢️GER</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Senha de Acesso</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button className="w-full py-3 bg-gold hover:bg-gold-dark text-black font-bold rounded-xl transition-all transform hover:scale-[1.02]">
                  ENTRAR
                </button>
                <button 
                  type="button"
                  onClick={() => setView('home')}
                  className="w-full py-3 text-zinc-500 hover:text-white transition-colors text-sm"
                >
                  Voltar para o site
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-gold">Gestão de Inscritos</h1>
                <p className="text-zinc-500">Workshop de Radiologia ITSK</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="font-bold">{registrations.length}</span>
                  <span className="text-zinc-500 text-sm">Inscritos</span>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-gold transition-colors text-gold"
                  title="Exportar CSV"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsAdminLoggedIn(false)}
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-red-950/30 hover:border-red-500/50 transition-colors text-red-500"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Pesquisar participantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-gold outline-none transition-colors"
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-bottom border-zinc-800">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">WhatsApp</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Instituição</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Curso</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {registrations
                    .filter(r => 
                      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.institution.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-medium">{reg.name}</td>
                      <td className="p-4 text-zinc-400">{reg.whatsapp}</td>
                      <td className="p-4 text-zinc-400">{reg.email}</td>
                      <td className="p-4 text-zinc-400">{reg.institution}</td>
                      <td className="p-4 text-zinc-400">{reg.course} ({reg.year})</td>
                      <td className="p-4 text-zinc-500 text-sm">{new Date(reg.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => setView('home')}
              className="mt-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Voltar para o site
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
              <Radio className="text-black w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-display font-bold tracking-tighter">☢️GER</span>
              <p className="text-[8px] text-gold uppercase tracking-widest leading-none">Radiologia</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-medium hover:text-gold transition-colors">Início</button>
            <button onClick={() => scrollTo(aboutRef)} className="text-sm font-medium hover:text-gold transition-colors">Sobre o Workshop</button>
            <button onClick={() => scrollTo(registrationRef)} className="text-sm font-medium hover:text-gold transition-colors">Inscrição</button>
            <button onClick={() => scrollTo(contactRef)} className="text-sm font-medium hover:text-gold transition-colors">Contactos</button>
            <button 
              onClick={() => scrollTo(registrationRef)}
              className="px-6 py-2.5 bg-gold text-black font-bold text-sm rounded-full hover:bg-gold-dark transition-all transform hover:scale-105"
            >
              INSCRIÇÃO
            </button>
          </nav>

          <button className="md:hidden text-gold" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-display font-bold">
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }} className="text-left hover:text-gold">Início</button>
              <button onClick={() => scrollTo(aboutRef)} className="text-left hover:text-gold">Sobre o Workshop</button>
              <button onClick={() => scrollTo(registrationRef)} className="text-left hover:text-gold">Inscrição</button>
              <button onClick={() => scrollTo(contactRef)} className="text-left hover:text-gold">Contactos</button>
              <button onClick={() => setView('admin')} className="text-left text-zinc-600 text-sm">Painel Admin</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000" 
            alt="Radiology Tech" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-20 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-bold uppercase tracking-widest mb-6">
              <Radio className="w-3 h-3 animate-pulse" />
              Workshop Científico
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.9] mb-6">
              1º Workshop de <br />
              <span className="gold-text-gradient">Radiologia do ITSK</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-light mb-8 border-l-2 border-gold pl-6">
              Tecnomedicina Radiológica: <br />
              <span className="text-white font-medium">Segurança, Aplicações Clínicas e Eficiência no Diagnóstico por Imagem.</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => scrollTo(registrationRef)}
                className="px-8 py-4 bg-gold text-black font-bold rounded-xl hover:bg-gold-dark transition-all transform hover:scale-105 flex items-center gap-2"
              >
                FAZER INSCRIÇÃO
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollTo(aboutRef)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                SAIBA MAIS
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating QR Code */}
        <div className="absolute bottom-10 right-10 hidden lg:block z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-white rounded-2xl shadow-2xl"
          >
            <QRCodeSVG value={window.location.href} size={100} />
            <p className="text-black text-[10px] font-bold text-center mt-2 uppercase tracking-tighter">Inscrição Rápida</p>
          </motion.div>
        </div>
      </section>

      {/* Institutional Quote */}
      <section className="py-20 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold italic text-zinc-300">
              "Unidos e movidos pela ciência e pela Radiologia"
            </h2>
            <p className="mt-4 text-gold font-bold tracking-widest uppercase text-sm">Organização Geral de Eventos de Radiologia</p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold mb-8">Sobre o <span className="text-gold">Workshop</span></h2>
              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                <p>
                  O Workshop de Radiologia organizado pela <span className="text-white font-bold">☢️GER</span> tem como objetivo promover conhecimento científico e troca de experiências na área da imagiologia.
                </p>
                <p>
                  O evento reúne estudantes e profissionais da saúde interessados na evolução da tecnologia radiológica no diagnóstico moderno, abordando desde a segurança do paciente até as mais recentes inovações em eficiência diagnóstica.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5">
                  <Users className="text-gold w-8 h-8 mb-4" />
                  <h4 className="font-bold text-white">Networking</h4>
                  <p className="text-sm text-zinc-500">Conecte-se com especialistas da área.</p>
                </div>
                <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5">
                  <Calendar className="text-gold w-8 h-8 mb-4" />
                  <h4 className="font-bold text-white">Certificado</h4>
                  <p className="text-sm text-zinc-500">Válido para horas complementares.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden border-2 border-gold/20">
                <img 
                  src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000" 
                  alt="Radiology Equipment" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 p-8 bg-gold text-black rounded-2xl shadow-2xl">
                <span className="text-4xl font-display font-bold">100%</span>
                <p className="text-xs font-bold uppercase tracking-wider">Científico</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section ref={registrationRef} className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Formulário de <span className="text-gold">Inscrição</span></h2>
            <p className="text-zinc-500">Preencha os dados abaixo para garantir sua vaga no evento.</p>
          </div>

          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleRegister}
                className="grid md:grid-cols-2 gap-6 p-8 bg-black border border-white/10 rounded-3xl shadow-2xl"
              >
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="Seu nome aqui"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">WhatsApp</label>
                  <input 
                    name="whatsapp"
                    type="tel" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="+244 000 000 000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Instituição</label>
                  <input 
                    name="institution"
                    type="text" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="Nome da sua faculdade ou empresa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Curso</label>
                  <input 
                    name="course"
                    type="text" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="Ex: Radiologia"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Ano de Formação</label>
                  <input 
                    name="year"
                    type="text" 
                    required
                    className="w-full px-4 py-4 bg-zinc-900 border border-white/5 rounded-xl focus:border-gold outline-none transition-colors"
                    placeholder="Ex: 2025"
                  />
                </div>
                <div className="md:col-span-2 mt-4">
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-gold text-black font-bold rounded-xl hover:bg-gold-dark transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'PROCESSANDO...' : 'ENVIAR INSCRIÇÃO'}
                    {!isSubmitting && <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 bg-zinc-900 border border-gold/30 rounded-3xl text-center"
              >
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-gold w-12 h-12" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-4">Inscrição realizada com sucesso!</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Você será redirecionado para o WhatsApp para receber sua confirmação automática.
                </p>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-gold font-bold hover:underline"
                >
                  Fazer outra inscrição
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-gold">Contactos</h3>
              <div className="space-y-4">
                <a href="mailto:ogerradiologiaoficial@gmail.com" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                    <Mail className="w-5 h-5" />
                  </div>
                  ogerradiologiaoficial@gmail.com
                </a>
                <a href="https://wa.me/244976500475" className="flex items-center gap-4 text-zinc-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                    <Phone className="w-5 h-5" />
                  </div>
                  +244 976 500 475
                </a>
                <div className="flex items-center gap-4 text-zinc-400">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  ITSK, Angola
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-gold">Redes Sociais</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center hover:border-gold transition-colors text-zinc-400 hover:text-gold">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center hover:border-gold transition-colors text-zinc-400 hover:text-gold">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center hover:border-gold transition-colors text-zinc-400 hover:text-gold">
                  <Users className="w-6 h-6" />
                </a>
              </div>
              <p className="text-zinc-500 text-sm">@oger_radiologia_oficial</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-gold">Localização</h3>
              <div className="w-full h-48 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-600">
                <MapPin className="w-12 h-12 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <Radio className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter">☢️GER</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-zinc-500 text-sm">Organização Geral de Eventos de Radiologia</p>
              <p className="text-zinc-700 text-[10px] uppercase tracking-widest mt-1">© 2026 Todos os direitos reservados</p>
            </div>

            <button 
              onClick={() => setView('admin')}
              className="text-zinc-800 hover:text-zinc-500 text-[10px] uppercase tracking-widest transition-colors"
            >
              Acesso Restrito
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
