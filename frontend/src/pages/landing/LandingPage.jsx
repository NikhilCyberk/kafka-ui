import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Container, Box, Button, Grid, Paper, TextField } from '@mui/material';
import { FaFeather, FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import Login from '../auth/Login';
import Signup from '../auth/Signup';

const sections = [
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Services' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function Header({ darkMode, onToggleDark, onOpenLogin, onOpenSignup }) {
  const { isAuthenticated } = useAuth();
  return (
    <AppBar position="sticky" elevation={0} color="inherit" sx={{ backdropFilter: 'blur(8px)', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <FaFeather size={28} />
          <Typography variant="h6" fontWeight={700}>Kafka UI</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {sections.map(s => (
            <Button
              key={s.id}
              color="inherit"
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </Button>
          ))}
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.href = '/dashboard'}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={onOpenLogin}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onOpenSignup}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Sign Up
              </Button>
            </>
          )}
          <IconButton onClick={onToggleDark} color="inherit" aria-label="Toggle dark mode">
            {darkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <Box
      id="hero"
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 12 },
      }}
    >
      <Container maxWidth="md" sx={{textAlign: 'center'}}>
        <Typography variant="h2" fontWeight={700} gutterBottom sx={{ letterSpacing: -2, fontSize: { xs: '2.5rem', md: '4rem' } }} data-aos="fade-down">
          Modern Kafka UI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 700, mx: 'auto' }} data-aos="fade-up">
          A beautiful, minimal, and powerful interface for managing your Kafka clusters. Built for speed, clarity, and confidence.
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 3, px: 5, py: 1.5 }}
          onClick={() => navigate('/signup')}
          data-aos="fade-up" data-aos-delay="200"
        >
          GET STARTED
        </Button>
      </Container>
    </Box>
  );
}

function About() {
  return (
    <Box id="about" sx={{ py: 10, bgcolor: 'background.paper' }}>
      <Container maxWidth="md">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6} data-aos="fade-right">
            <Typography variant="h3" fontWeight={700} gutterBottom>
              About Kafka UI
            </Typography>
            <Typography color="text.secondary" paragraph>
              Kafka UI is an open-source, modern dashboard for Apache Kafka. It provides a clean, intuitive interface to monitor, manage, and troubleshoot your Kafka clusters with ease.
            </Typography>
            <Typography color="text.secondary">
              Built with React, Material UI, and Go, it's designed for reliability, speed, and a delightful user experience.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} data-aos="fade-left">
            <Box component={motion.div} whileInView={{ scale: [0.9, 1], rotate: [0, -5, 5, 0] }} transition={{ duration: 0.8 }}>
              <Paper sx={{ p: 4, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color:'white' }}>
                <FaFeather size={64} />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function Features() {
  const features = [
    {
      title: 'Cluster Management',
      description: 'Get a high-level overview of your cluster health, or dive deep into broker and topic metrics.',
      imageUrl: '/screenshots/Screenshot 2025-06-22 152151.png',
    },
    {
      title: 'Topic Deep-Dive',
      description: 'Inspect topic configurations, partition details, and produce or consume messages with ease.',
      imageUrl: '/screenshots/Screenshot 2025-06-22 152237.png',
    },
    {
      title: 'Consumer Group Monitoring',
      description: 'Track consumer lag in real-time and view detailed information about consumer group members.',
      imageUrl: '/screenshots/Screenshot 2025-06-22 152406.png',
    },
    {
      title: 'Advanced Metrics',
      description: 'A dedicated metrics dashboard for cluster health, broker performance, and topic throughput.',
      imageUrl: '/screenshots/Screenshot 2025-06-22 152444.png',
    }
  ];

  return (
    <Box id="features" sx={{ py: 10, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} align="center" gutterBottom data-aos="fade-up">
          Powerful Features
        </Typography>
        <Typography color="text.secondary" align="center" paragraph sx={{ maxWidth: 700, mx: 'auto' }} data-aos="fade-up">
          Everything you need to manage your Kafka clusters with confidence.
        </Typography>
        <Grid container spacing={4} mt={2}>
          {features.map((feature, i) => (
            <Grid item xs={12} md={6} key={feature.title} data-aos="fade-up" data-aos-delay={i * 100}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ px: 2, pt: 1 }}>{feature.title}</Typography>
                <Typography color="text.secondary" sx={{ px: 2, mb: 2 }}>{feature.description}</Typography>
                <Box
                  component="img"
                  src={feature.imageUrl}
                  alt={feature.title}
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function Testimonials() {
  return (
    <Box id="testimonials" sx={{ py: 10, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight={700} align="center" gutterBottom data-aos="fade-up">
          Testimonials
        </Typography>
        <Typography color="text.secondary" align="center" paragraph data-aos="fade-up">
          What our users are saying
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Paper sx={{ p: 3 }} data-aos="fade-up" data-aos-delay="100">
            <Typography variant="body1" gutterBottom>
              "Kafka UI has made managing our clusters so much easier! The interface is clean and intuitive."
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              - Jane Doe, Data Engineer
            </Typography>
          </Paper>
          <Paper sx={{ p: 3 }} data-aos="fade-up" data-aos-delay="200">
            <Typography variant="body1" gutterBottom>
              "A must-have tool for anyone working with Kafka. The metrics dashboard is a game changer."
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              - John Smith, DevOps
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function CTA() {
  const navigate = useNavigate();
  return (
    <Box id="cta" sx={{ py: 10, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} gutterBottom data-aos="fade-up">
          Ready to Get Started?
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3, px: 5, py: 1.5, bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'secondary.main' } }}
          data-aos="fade-up"
          data-aos-delay="100"
           onClick={() => navigate('/signup')}
        >
          Create Account
        </Button>
      </Container>
    </Box>
  );
}

function Contact() {
  const theme = useTheme();
  return (
    <Box id="contact" sx={{ py: 10 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" fontWeight={700} align="center" gutterBottom data-aos="fade-up">
          Contact Us
        </Typography>
        <Typography color="text.secondary" align="center" paragraph data-aos="fade-up">
          Have questions? We'd love to hear from you.
        </Typography>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <TextField
            type="email"
            placeholder="Your Email"
            variant="outlined"
            fullWidth
            InputProps={{ style: { borderRadius: 8 } }}
          />
          <TextField
            placeholder="Your Message"
            variant="outlined"
            fullWidth
            multiline
            minRows={4}
            InputProps={{ style: { borderRadius: 8 } }}
          />
          <Button variant="contained" size="large">
            Send Message
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Kafka UI. All rights reserved.
      </Typography>
    </Box>
  );
}

export default function LandingPage({ darkMode, onToggleDark, openLoginOnMount }) {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [signupOpen, setSignupOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (openLoginOnMount) {
      setLoginOpen(true);
    }
  }, [openLoginOnMount]);

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    navigate('/dashboard');
  };

  return (
    <Box>
      <Header
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenSignup={() => setSignupOpen(true)}
      />
      <main>
        <Hero />
        <About />
        <Features />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Sign In" maxWidth="xs">
        <Login 
          onSuccess={handleLoginSuccess} 
          inModal={true} 
          switchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }}
        />
      </Modal>
      <Modal open={signupOpen} onClose={() => setSignupOpen(false)} title="Sign Up" maxWidth="xs">
        <Signup 
          onSuccess={() => setSignupOpen(false)} 
          inModal={true} 
          switchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }}
        />
      </Modal>
    </Box>
  );
} 