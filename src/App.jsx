import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WixContextProvider } from './context/WixContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { StorePage } from './pages/StorePage';
import { ProductPage } from './pages/ProductPage';
import './App.css';

function App() {
  return (
    <WixContextProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <div className="app-layout">
              <Navbar />
              
              {/* Main viewports */}
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                </Routes>
              </main>

              <Footer />
              <CartDrawer />
            </div>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </WixContextProvider>
  );
}

export default App;
