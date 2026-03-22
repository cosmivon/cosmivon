import React, { useState, Component, ErrorInfo, ReactNode, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Workflow, 
  Smartphone, 
  Bot, 
  FileText, 
  BarChart3, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Mail,
  Send,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType}`;
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6 text-center">
          <div className="glass p-8 rounded-3xl border-red-500/20 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Error</h2>
            <p className="text-white/60 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black font-bold rounded-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Starfield Background ---
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener('resize', resize);
    resize();

    const stars: { x: number; y: number; z: number; px: number; py: number }[] = [];
    const numStars = 800;
    const speed = 2.5;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * w - w / 2,
        y: Math.random() * h - h / 2,
        z: Math.random() * w,
        px: 0,
        py: 0
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, w, h);

      ctx.translate(w / 2, h / 2);

      for (let i = 0; i < numStars; i++) {
        const s = stars[i];
        s.z -= speed;

        if (s.z <= 0) {
          s.z = w;
          s.x = Math.random() * w - w / 2;
          s.y = Math.random() * h - h / 2;
          s.px = 0;
          s.py = 0;
        }

        const x = (s.x / s.z) * w;
        const y = (s.y / s.z) * h;

        if (s.px !== 0) {
          ctx.strokeStyle = `rgba(0, 242, 255, ${Math.min(1, (w - s.z) / w)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(s.px, s.py);
          ctx.stroke();
        }

        s.px = x;
        s.py = y;
      }

      ctx.translate(-w / 2, -h / 2);
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: '#050505' }}
    />
  );
};

// --- Components ---

const Logo = () => (
  <div className="relative w-14 h-14 group-hover:scale-110 transition-transform duration-500">
    <div className="absolute inset-0 bg-[#00f2ff] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="50%" stopColor="#7000ff" />
          <stop offset="100%" stopColor="#00f2ff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="10 5" className="animate-[spin_20s_linear_infinite]" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeDasharray="5 10" className="animate-[spin_15s_linear_infinite_reverse]" />
      <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="url(#logo-grad)" className="opacity-80" />
      <path d="M50 30 L70 50 L50 70 L30 50 Z" fill="white" className="opacity-40" />
      <circle cx="50" cy="50" r="5" fill="white" className="animate-pulse" />
    </svg>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Vision', href: '#vision' },
    { name: 'Products', href: '#products' },
    { name: 'Process', href: '#process' },
    { name: 'Ethics', href: '#ethics' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer">
            <Logo />
            <div className="flex flex-col min-w-max pr-4">
              <span className="font-display font-extrabold text-3xl md:text-5xl tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                COSMIVON
              </span>
              <span className="text-xs uppercase tracking-[0.5em] font-bold text-[#00f2ff] leading-none mt-2 drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                Technologies
              </span>
            </div>
          </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-white/70 hover:text-[#00f2ff] transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-[#00f2ff] transition-all"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 right-0 glass border-b border-white/10 p-6 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#00f2ff] mb-6">
            <Zap className="w-3 h-3" />
            <span>Redefining Digital Efficiency</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-extrabold leading-[0.9] mb-6 tracking-tighter">
            Practical <span className="gradient-text">AI-Powered</span> Products for the Next Wave.
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-lg">
            Cosmivon Technologies builds intelligent tools and autonomous agents designed to scale your workflows and create a resilient ecosystem of digital products.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#vision" 
              className="px-8 py-4 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Our Vision <ChevronRight className="w-4 h-4" />
            </a>
            <a 
              href="#contact" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="w-full aspect-square rounded-full border border-white/5 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/20 to-[#7000ff]/20 blur-3xl rounded-full" />
            <div className="w-3/4 h-3/4 rounded-2xl glass border border-white/10 rotate-12 flex items-center justify-center p-8">
              <div className="w-full h-full bg-black/40 rounded-xl border border-white/5 p-6 font-mono text-xs text-white/40 overflow-hidden">
                <div className="mb-2 text-[#00f2ff]">&gt; cosmivon --init</div>
                <div className="mb-2">Initializing AI ecosystem...</div>
                <div className="mb-2 text-[#7000ff]">Success: Agent core online.</div>
                <div className="mb-2">Building micro-profit modules...</div>
                <div className="flex gap-1 mb-2">
                  <div className="w-1/3 h-1 bg-[#00f2ff]" />
                  <div className="w-1/4 h-1 bg-[#7000ff]" />
                  <div className="w-1/2 h-1 bg-white/20" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="h-12 bg-white/5 rounded" />
                  <div className="h-12 bg-white/5 rounded" />
                  <div className="h-12 bg-white/5 rounded" />
                  <div className="h-12 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-6xl font-display font-bold mb-8 tracking-tight">Building the Future, <span className="text-white/40">Step by Step.</span></h2>
          <p className="text-xl text-white/60 leading-relaxed mb-12">
            Cosmivon Technologies isn't about hype; it's about pragmatism. We use modern AI tools to design, build, and scale useful software that solves real-world friction. We view AI as a powerful tool and a digital workforce that, when applied correctly, creates immense value.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl glass border-white/5">
              <Target className="text-[#00f2ff] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Practical Value</h3>
              <p className="text-white/50">Every product we build must solve a specific problem and generate sustainable value from day one.</p>
            </div>
            <div className="p-6 rounded-2xl glass border-white/5">
              <Layers className="text-[#7000ff] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Digital Workforce</h3>
              <p className="text-white/50">We leverage AI agents as active participants in our product lifecycle, from development to operations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Vision = () => {
  return (
    <section id="vision" className="py-24 cosmic-gradient">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-6xl font-display font-bold mb-6 tracking-tight">The Infinite Product Model</h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-16">
          Our vision is to create a platform that can build, run, and scale many autonomous, AI-driven products under one roof.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Micro-Profit', desc: 'Focused tools generating consistent revenue at scale.' },
            { title: 'Cumulative Growth', desc: 'Many small streams forming a resilient, massive ecosystem.' },
            { title: 'Autonomous Agents', desc: 'AI that builds, launches, and improves products independently.' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl glass border-white/10 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-[#00f2ff]">
                {i === 0 ? <BarChart3 /> : i === 1 ? <Workflow /> : <Bot />}
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-white/50 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Products = () => {
  const domains = [
    { icon: <Cpu size={32} />, title: 'SaaS Products', desc: 'Focused software solutions for specific industry niches.' },
    { icon: <Workflow size={32} />, title: 'Automation Tools', desc: 'Streamlining complex workflows with intelligent logic.' },
    { icon: <Smartphone size={32} />, title: 'Mobile Apps', desc: 'Utility-first mobile experiences powered by AI.' },
    { icon: <Bot size={32} />, title: 'AI Agent Systems', desc: 'Autonomous entities that perform digital tasks.' },
    { icon: <FileText size={32} />, title: 'Content Tools', desc: 'AI-assisted publishing and creative utilities.' },
    { icon: <BarChart3 size={32} />, title: 'Finance Utilities', desc: 'Smart tools for business and personal finance.' },
    { icon: <Calendar size={32} />, title: 'Booking Platforms', desc: 'Intelligent scheduling and service management.' },
  ];

  return (
    <section id="products" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-6xl font-display font-bold mb-4 tracking-tight">Product Domains</h2>
          <p className="text-white/50 max-w-xl">Where we are active and where we aim to expand our ecosystem.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, i) => (
            <div key={i} className="group p-8 rounded-2xl glass border-white/5 hover:border-[#00f2ff]/30 transition-all">
              <div className="text-white/40 group-hover:text-[#00f2ff] transition-colors mb-6">
                {domain.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{domain.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{domain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    { title: 'Identify & Validate', desc: 'Finding real-world friction and high-value workflows.' },
    { title: 'Design with AI', desc: 'Using AI tools to explore architectures and UX flows.' },
    { title: 'Build Iteratively', desc: 'Shipping minimal, reliable versions and improving.' },
    { title: 'Automate & Scale', desc: 'Introducing agents to run products with less manual effort.' },
  ];

  return (
    <section id="process" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">How We Work</h2>
        <div className="grid md:grid-cols-4 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-white/10 -z-10" />
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-black border-2 border-[#00f2ff] flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-white/40">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Ethics = () => {
  return (
    <section id="ethics" className="py-24 bg-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="p-12 rounded-3xl glass border-white/10 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ethics & Principles</h2>
            <p className="text-white/60 mb-8">
              We believe in building technology that is ethical, transparent, and responsible. Our constraints are our strengths.
            </p>
            <div className="grid gap-4">
              {[
                'No illegal activities or harmful products.',
                'Zero copyright violations in training or output.',
                'No misuse of third-party resources.',
                'Transparent and ethical use of AI systems.'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <ShieldCheck className="text-[#00f2ff] w-5 h-5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#00f2ff]/10 to-transparent border border-white/5" />
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#7000ff]/10 to-transparent border border-white/5 mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const path = 'contacts';
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, path), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Send Email via Backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('error');
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Let's Collaborate.</h2>
          <p className="text-xl text-white/60 mb-8">
            Interested in working with Cosmivon or exploring an idea together? We're always open to partnerships and innovative projects.
          </p>
          <div className="flex items-center gap-4 text-white/40">
            <Mail className="w-6 h-6" />
            <a href="mailto:founder@cosmivon.com" className="hover:text-[#00f2ff] transition-colors">founder@cosmivon.com</a>
          </div>
        </div>

        <div className="p-8 rounded-3xl glass border-white/10">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-[#00f2ff]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="text-[#00f2ff] w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-white/50 mb-8">We'll get back to you as soon as possible.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="text-[#00f2ff] font-semibold underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f2ff] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40">Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f2ff] transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Company (Optional)</label>
                <input 
                  type="text" 
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f2ff] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f2ff] transition-colors resize-none"
                />
              </div>
              <button 
                disabled={status === 'loading'}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-[#00f2ff] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : (
                  <>Send Message <Send className="w-4 h-4" /></>
                )}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 border-t border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg flex items-center justify-center">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight">COSMIVON</span>
            <span className="text-[8px] uppercase tracking-widest text-white/40">Technologies</span>
          </div>
        </div>
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} Cosmivon Technologies. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-white/40">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen text-white selection:bg-[#00f2ff] selection:text-black">
        <Starfield />
        <Navbar />
        <Hero />
        <About />
        <Vision />
        <Products />
        <Process />
        <Ethics />
        <Contact />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
