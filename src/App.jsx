import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WixContextProvider } from './context/WixContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { MembersProvider } from './context/MembersContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { StorePage } from './pages/StorePage';
import { ProductPage } from './pages/ProductPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CityLandingPage } from './pages/CityLandingPage';
import { DynamicStorePage } from './pages/DynamicStorePage';
import { ZonasPage } from './pages/ZonasPage';
import { ThankYouPage } from './pages/ThankYouPage';
import './App.css';

function App() {
  return (
    <WixContextProvider>
      <LanguageProvider>
        <CartProvider>
          <MembersProvider>
            <Router>
              <div className="app-layout">
                <Navbar />

                {/* Main viewports */}
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/product/:slug" element={<ProductPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/mi-cuenta" element={<AccountPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    {/* Dynamic CMS store pages */}
                    <Route path="/tienda/:slug" element={<DynamicStorePage />} />
                    {/* Hub page for all dynamic landings & stores */}
                    <Route path="/zonas" element={<ZonasPage />} />
                    {/* Thank You page after checkout */}
                    <Route path="/thank-you" element={<ThankYouPage />} />
                    {/* Catch-all: dynamic CMS landing pages */}
                    <Route path="/:slug" element={<CityLandingPage />} />
                  </Routes>
                </main>

                <Footer />
                <CartDrawer />
              </div>
            </Router>
          </MembersProvider>
        </CartProvider>
      </LanguageProvider>
    </WixContextProvider>
  );
}

export default App;
