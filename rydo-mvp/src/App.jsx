import { useEffect, useMemo, useState } from 'react';
import toyotaFortunerImage from './assets/download.jpg';
import corollaCrossImage from './assets/05.jpg';
import landingHeroImage from './assets/336edddf5d87-hands-car-keys.jpg';
import mazdaCx5Image from './assets/maz15401_cx-5_auto_g20_maxx_platinum_quartz_cx5naw5m_front-3-4_980x520.jpg';
import yamahaMt07Image from './assets/2025_MT07_MDNMD_AUS_STU_001_800x600.jpg';
import hondaCb300rImage from './assets/images.jpg';
import teslaModel3Image from './assets/arenaev_004.jpg';

// Backend API URL — set VITE_API_URL in .env for production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Local image map — matched to vehicle names from Supabase
const IMAGE_MAP = {
  'Toyota Fortuner GR': toyotaFortunerImage,
  'Corolla Cross': corollaCrossImage,
  'Mazda CX-5': mazdaCx5Image,
  'Yamaha MT-07': yamahaMt07Image,
  'Honda CB300R': hondaCb300rImage,
  'Tesla Model 3': teslaModel3Image,
};

// Fallback hardcoded vehicles (used if backend is unreachable)
const FALLBACK_VEHICLES = [
  { id: 1, name: 'Toyota Fortuner GR', vehicleType: 'Car SUV', category: 'Cars', price: 40, owner: 'Sheikh Modi', rating: 4.5, reviews: 56, distance: 2.8, negotiable: true, available: true, verified: true, fuel: 'Petrol', seats: 7, transmission: 'Automatic', image: toyotaFortunerImage },
  { id: 2, name: 'Corolla Cross', vehicleType: 'Car Sedan', category: 'Cars', price: 44, owner: 'Aydid Sheikh', rating: 4.5, reviews: 69, distance: 4.0, negotiable: false, available: true, verified: true, fuel: 'Petrol', seats: 5, transmission: 'Automatic', image: corollaCrossImage },
  { id: 3, name: 'Mazda CX-5', vehicleType: 'Car SUV', category: 'Cars', price: 50, owner: 'Emma Davis', rating: 4.8, reviews: 67, distance: 4.1, negotiable: true, available: true, verified: true, fuel: 'Petrol', seats: 5, transmission: 'Automatic', image: mazdaCx5Image },
  { id: 4, name: 'Yamaha MT-07', vehicleType: 'Bike', category: 'Bikes', price: 25, owner: 'Liam Chen', rating: 4.7, reviews: 32, distance: 1.5, negotiable: true, available: true, verified: true, fuel: 'Petrol', seats: 2, transmission: 'Manual', image: yamahaMt07Image },
  { id: 5, name: 'Honda CB300R', vehicleType: 'Bike', category: 'Bikes', price: 22, owner: 'Marcus Wong', rating: 4.6, reviews: 28, distance: 2.0, negotiable: true, available: true, verified: true, fuel: 'Petrol', seats: 2, transmission: 'Manual', image: hondaCb300rImage },
  { id: 6, name: 'Tesla Model 3', vehicleType: 'Electric', category: 'Electric', price: 65, owner: 'Priya Patel', rating: 4.9, reviews: 89, distance: 3.2, negotiable: false, available: true, verified: true, fuel: 'Electric', seats: 5, transmission: 'Automatic', image: teslaModel3Image },
];

const getOwnerReply = (vehicle, offer) => {
  if (!offer || Number.isNaN(offer)) return `Please send a clear dollar offer for ${vehicle.name}.`;
  if (offer >= vehicle.price) return `Deal confirmed at $${offer}/day. I appreciate the straightforward offer.`;
  if (offer >= vehicle.price - 4) return `I can accept $${offer}/day. Tap Accept Offer to lock it in.`;
  const counter = Math.max(vehicle.price - 3, offer + 2);
  return `I can do $${counter}/day for this vehicle. Let me know if you'd like to proceed.`;
};

const VehicleVisual = ({ vehicle, compact = false }) => {
  const sizeClass = compact ? 'h-28' : 'h-44';
  const imageBoxClass = compact ? 'max-h-[82%] max-w-[90%]' : 'max-h-[84%] max-w-[92%]';
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-300 ${sizeClass} bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(30,64,175,0.12),transparent_50%)]" />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-3.5">
        <div className={`flex h-full w-full items-center justify-center rounded-xl bg-white/55 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.24)] ${imageBoxClass}`}>
          <img src={vehicle.image} alt={vehicle?.name ?? 'Vehicle render'} className="h-full w-full rounded-xl object-contain object-center p-2 drop-shadow-[0_8px_14px_rgba(15,23,42,0.2)]" loading="lazy" />
        </div>
      </div>
      <div className="absolute left-4 top-4 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-slate-700">
        {vehicle?.name ?? 'Premium Vehicle'}
      </div>
    </div>
  );
};

const IconBadge = ({ children }) => (
  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700">
    {children}
  </span>
);

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [counterOfferText, setCounterOfferText] = useState('');
  const [ownerMessage, setOwnerMessage] = useState('');
  const [pendingAcceptedPrice, setPendingAcceptedPrice] = useState(null);
  const [agreedPrice, setAgreedPrice] = useState(null);
  const [trackingStep, setTrackingStep] = useState(1);
  const [bookingId, setBookingId] = useState('RYD-2026-00000');
  const [bookingLoading, setBookingLoading] = useState(false);

  const days = 3;
  const flatFee = 5;
  const agreedDaily = agreedPrice ?? selectedVehicle?.price ?? 0;

  // Fetch vehicles from backend on mount
  useEffect(() => {
    fetch(`${API_URL}/vehicles`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((v) => ({
            id: v.id,
            name: v.name,
            vehicleType: v.vehicle_type,
            category: v.category,
            price: Number(v.price_per_day),
            owner: v.owner_name,
            rating: Number(v.rating),
            reviews: v.reviews,
            distance: Number(v.distance_km),
            negotiable: v.negotiable,
            available: v.available,
            verified: true,
            fuel: v.fuel,
            seats: v.seats,
            transmission: v.transmission,
            image: IMAGE_MAP[v.name] || toyotaFortunerImage,
          }));
          setVehicles(mapped);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch vehicles:', err);
      });
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vehicles.filter((v) => {
      const byCategory = selectedCategory === 'All' || v.category === selectedCategory;
      if (!byCategory) return false;
      if (!q) return true;
      return [v.name, v.vehicleType, v.owner, v.category].some((field) =>
        field.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory, vehicles]);

  const handleLogin = async () => {
    if (!email || !password || !consent) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setLoggedInEmail(email);
        setScreen('search');
      } else {
        const regRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (regRes.ok) {
          setLoggedInEmail(email);
          setScreen('search');
        } else {
          const err = await regRes.json();
          setLoginError(err.detail || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoggedInEmail(email);
      setScreen('search');
    } finally {
      setLoginLoading(false);
    }
  };

  const openVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCounterOfferText('');
    setOwnerMessage('');
    setPendingAcceptedPrice(null);
    setAgreedPrice(vehicle.price);
    setScreen('details');
  };

  const sendCounterOffer = () => {
    const parsed = Number(counterOfferText.replace(/[^0-9.]/g, ''));
    setOwnerMessage(getOwnerReply(selectedVehicle, parsed));
    setPendingAcceptedPrice(Number.isNaN(parsed) ? null : parsed);
  };

  const acceptOffer = () => {
    if (pendingAcceptedPrice) {
      setAgreedPrice(pendingAcceptedPrice);
      setOwnerMessage(`Offer accepted. Agreed price is now $${pendingAcceptedPrice}/day.`);
    }
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    const total = agreedDaily * days + flatFee;
    console.log('Sending booking to:', `${API_URL}/bookings`);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: loggedInEmail || email,
          vehicle_id: selectedVehicle.id,
          vehicle_name: selectedVehicle.name,
          owner_name: selectedVehicle.owner,
          days,
          daily_rate: agreedDaily,
          service_fee: flatFee,
          total_amount: total,
        }),
      });
      console.log('Booking response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Booking data:', data);
        if (data.booking?.id) {
          setBookingId(`RYD-${data.booking.id.slice(0, 8).toUpperCase()}`);
        }
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBookingLoading(false);
      setScreen('confirmed');
    }
  };

  const resetToHome = () => {
    setScreen('search');
    setSelectedVehicle(null);
    setCounterOfferText('');
    setOwnerMessage('');
    setPendingAcceptedPrice(null);
    setAgreedPrice(null);
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const openTracking = () => {
    setTrackingStep(2);
    setScreen('tracking');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] rounded-[2.2rem] overflow-hidden border-8 border-[#0b1325] shadow-[0_24px_60px_rgba(0,0,0,0.55)] bg-[#070f1f]">
        <div className="h-[810px] overflow-y-auto">

          {/* WELCOME */}
          {screen === 'welcome' && (
            <section className="h-full bg-gradient-to-b from-[#050b18] via-[#0b1730] to-[#030712] p-6 flex flex-col">
              <p className="text-blue-300 text-xs tracking-[0.24em] uppercase">Melbourne • RYDO</p>
              <h1 className="text-4xl font-black mt-3">RYDO</h1>
              <p className="text-slate-200 mt-5 text-lg">Smart car sharing, made simple.</p>
              <p className="text-slate-300 mt-2">Negotiate directly. Save more with a flat $5 fee.</p>
              <div className="mt-8 rounded-3xl bg-slate-900/70 border border-slate-700 p-5">
                <div className="relative h-44 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/40">
                  <img src={landingHeroImage} alt="Hands exchanging car keys" className="h-full w-full object-cover object-center" loading="eager" />
                </div>
                <p className="text-sm text-slate-300 mt-3">Premium Vehicle Preview</p>
                <p className="text-lg font-semibold">Car • Bike • Electric</p>
              </div>
              <div className="mt-auto space-y-3">
                <button onClick={() => setScreen('login')} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 font-semibold">Get Started</button>
                <button onClick={() => setScreen('login')} className="w-full text-slate-300 underline underline-offset-4">Sign in</button>
              </div>
            </section>
          )}

          {/* LOGIN */}
          {screen === 'login' && (
            <section className="h-full bg-slate-100 text-slate-900">
              <div className="bg-gradient-to-b from-[#060d1c] to-[#0f1b34] text-white p-6 rounded-b-[2rem]">
                <button onClick={() => setScreen('welcome')} className="text-slate-300 text-sm">← Back</button>
                <h2 className="text-3xl font-black mt-4">RYDO</h2>
                <p className="text-slate-300 mt-1">Welcome back</p>
              </div>
              <div className="p-6 space-y-4">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-300 p-3" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-xl border border-slate-300 p-3" />
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-sm font-semibold mb-2">Identity verification</p>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2"><IconBadge>🪪</IconBadge>Driver Licence</p>
                    <p className="text-sm flex items-center gap-2"><IconBadge>◉</IconBadge>Face Scan</p>
                    <p className="text-sm flex items-center gap-2"><IconBadge>📱</IconBadge>Phone Number</p>
                  </div>
                </div>
                <label className="flex gap-3 text-xs leading-relaxed">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                  I consent to minimal data usage for verification only. RYDO follows data minimisation principles.
                </label>
                {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button className="rounded-xl border border-slate-300 bg-white py-2 flex items-center justify-center gap-2 shadow-sm">
                    <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.7-5.5 3.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.8-.1-1.1H12z" />
                      </svg>
                    </span>
                    Google
                  </button>
                  <button className="rounded-xl border border-slate-300 bg-white py-2 flex items-center justify-center gap-2 shadow-sm">
                    <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black">
                        <path d="M16.37 12.41c.01 2.7 2.37 3.6 2.4 3.62-.02.06-.37 1.27-1.2 2.52-.72 1.08-1.47 2.16-2.64 2.18-1.14.02-1.51-.68-2.82-.68-1.31 0-1.72.66-2.8.7-1.13.04-1.99-1.13-2.71-2.21-1.47-2.13-2.59-6.02-1.08-8.65.75-1.31 2.09-2.14 3.55-2.16 1.11-.02 2.16.75 2.82.75.66 0 1.9-.93 3.2-.79.54.02 2.06.22 3.04 1.66-.08.05-1.82 1.06-1.8 3.16zM14.53 6.45c.6-.73 1.01-1.74.9-2.75-.86.03-1.9.57-2.52 1.3-.56.64-1.05 1.67-.92 2.66.96.07 1.94-.49 2.54-1.21z" />
                      </svg>
                    </span>
                    Apple
                  </button>
                </div>
                <button
                  disabled={!email || !password || !consent || loginLoading}
                  onClick={handleLogin}
                  className="w-full rounded-xl bg-blue-600 disabled:bg-slate-400 text-white py-3 font-semibold"
                >
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </section>
          )}

          {/* SEARCH */}
          {screen === 'search' && (
            <section className="h-full bg-slate-100 text-slate-900 p-5">
              <button onClick={() => setScreen('login')} className="text-sm text-slate-600">← Back</button>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-2">RYDO • Melbourne VIC</p>
              <h3 className="text-2xl font-black mt-2">Find cars, bikes, and electric rides near you</h3>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Toyota, bike, Tesla, owner..." className="w-full mt-4 rounded-2xl border border-slate-300 bg-white px-4 py-3" />
              <div className="flex gap-2 mt-3">
                {['All', 'Cars', 'Bikes', 'Electric'].map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3 pb-10">
                {filteredVehicles.map((v) => (
                  <button key={v.id} onClick={() => openVehicle(v)} className="w-full text-left rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md">
                    <VehicleVisual vehicle={v} compact />
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-lg">{v.name}</p>
                        <p className="text-sm text-slate-600">{v.vehicleType} • {v.owner}</p>
                        <p className="text-sm text-slate-600">⭐ {v.rating} ({v.reviews}) • {v.distance}km</p>
                      </div>
                      <p className="font-bold text-blue-700">${v.price}/day</p>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      {v.available && <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Available</span>}
                      {v.negotiable && <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">Negotiable</span>}
                      {v.verified && <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-700">Owner verified</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* DETAILS */}
          {screen === 'details' && selectedVehicle && (
            <section className="h-full bg-slate-100 text-slate-900 p-5">
              <button onClick={() => setScreen('search')} className="text-sm text-slate-600">← Back</button>
              <div className="mt-3"><VehicleVisual vehicle={selectedVehicle} /></div>
              <h3 className="text-2xl font-black mt-4">{selectedVehicle.name}</h3>
              <p className="text-slate-600">{selectedVehicle.vehicleType} • ${agreedDaily}/day</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white border border-slate-200 p-3">Seats: {selectedVehicle.seats}</div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">Transmission: {selectedVehicle.transmission}</div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">Fuel: {selectedVehicle.fuel}</div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">Distance: {selectedVehicle.distance}km</div>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 text-sm">
                <p className="font-semibold">Owner: {selectedVehicle.owner}</p>
                <p className="text-emerald-700">✓ Verified owner</p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                <p className="font-semibold">Accept listed price or negotiate</p>
                <button
                  onClick={() => {
                    setAgreedPrice(selectedVehicle.price);
                    setOwnerMessage(`Listed price accepted at $${selectedVehicle.price}/day. You can continue booking now.`);
                  }}
                  className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 font-semibold"
                >
                  Accept Listed Price (${selectedVehicle.price}/day)
                </button>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Or negotiate</p>
                <div className="mt-3 flex gap-2">
                  <input value={counterOfferText} onChange={(e) => setCounterOfferText(e.target.value)} placeholder="Enter counter-offer e.g. $35" className="flex-1 rounded-xl border border-slate-300 p-2" />
                  <button onClick={sendCounterOffer} className="rounded-xl bg-blue-600 text-white px-4">Send</button>
                </div>
                {ownerMessage && <p className="mt-3 text-sm rounded-xl bg-slate-100 p-3">Owner: {ownerMessage}</p>}
                <button onClick={acceptOffer} disabled={!pendingAcceptedPrice} className="mt-3 rounded-xl bg-slate-900 text-white px-4 py-2 disabled:bg-slate-400">Accept Offer</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 pb-8">
                <button className="rounded-xl border border-slate-300 bg-white py-3">Message</button>
                <button onClick={() => setScreen('summary')} className="rounded-xl bg-blue-600 text-white py-3 font-semibold">Book Now</button>
              </div>
            </section>
          )}

          {/* SUMMARY */}
          {screen === 'summary' && selectedVehicle && (
            <section className="h-full bg-slate-100 text-slate-900 p-5">
              <button onClick={() => setScreen('details')} className="text-sm text-slate-600">← Back</button>
              <h3 className="text-2xl font-black mt-3">Booking Summary</h3>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                <div className="mb-3"><VehicleVisual vehicle={selectedVehicle} compact /></div>
                <p className="font-bold">{selectedVehicle.name}</p>
                <p className="text-sm">Owner: {selectedVehicle.owner} • ✓ Verified</p>
                <p className="text-sm mt-2">Pickup date: 3 Apr 2026</p>
                <p className="text-sm">Drop-off date: 6 Apr 2026</p>
                <p className="text-sm">Pickup location: Spencer St, CBD</p>
                <p className="text-sm">Duration: 3 days</p>
                <p className="text-sm">Payment method: Visa ending 7839</p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Pickup Map</p>
                <div className="mt-2 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 h-28 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="absolute left-[55%] top-[45%] -translate-x-1/2 -translate-y-1/2 text-red-600 text-xl">📍</div>
                  <div className="absolute left-3 bottom-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">Spencer St, CBD</div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Agreed price</span><span>${agreedDaily} × {days}</span></div>
                <div className="flex justify-between"><span>Subtotal</span><span>${agreedDaily * days}</span></div>
                <div className="flex justify-between"><span>RYDO flat fee</span><span>${flatFee}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${agreedDaily * days + flatFee}</span></div>
              </div>
              <p className="mt-4 rounded-xl bg-emerald-100 text-emerald-800 p-3 text-sm font-semibold">You saved $26 through negotiation</p>
              <button
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="w-full mt-4 rounded-xl bg-blue-600 disabled:bg-slate-400 text-white py-3 font-semibold"
              >
                {bookingLoading ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </section>
          )}

          {/* CONFIRMED */}
          {screen === 'confirmed' && selectedVehicle && (
            <section className="h-full bg-slate-100 text-slate-900">
              <div className="bg-gradient-to-b from-[#040a17] to-[#0e1a33] text-white p-6 rounded-b-[2rem]">
                <button onClick={() => setScreen('summary')} className="text-slate-300 text-sm">← Back</button>
                <div className="mt-4 h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl">✓</div>
                <h3 className="text-3xl font-black mt-4">Booking Confirmed</h3>
                <p className="text-slate-300 mt-1">Booking ID: {bookingId}</p>
              </div>
              <div className="p-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-sm">
                  <div className="mb-3"><VehicleVisual vehicle={selectedVehicle} compact /></div>
                  <p className="font-bold">{selectedVehicle.name}</p>
                  <p>Owner: {selectedVehicle.owner} • ✓ Verified</p>
                  <p className="mt-2">3 Apr 2026 → 6 Apr 2026 • Spencer St, CBD</p>
                  <p className="mt-2">Paid with Visa ending 7839</p>
                </div>
                <button onClick={openTracking} className="w-full mt-4 rounded-xl bg-blue-600 text-white py-3 font-semibold">Track My Booking</button>
                <button onClick={resetToHome} className="w-full mt-3 rounded-xl border border-slate-300 bg-white py-3 font-semibold">Return Home</button>
              </div>
            </section>
          )}

          {/* TRACKING */}
          {screen === 'tracking' && selectedVehicle && (
            <section className="h-full bg-slate-100 text-slate-900 p-5">
              <button onClick={() => setScreen('confirmed')} className="text-sm text-slate-600">← Back</button>
              <h3 className="text-2xl font-black mt-3">Track My Booking</h3>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                <p className="font-bold">{selectedVehicle.name}</p>
                <p className="text-sm text-slate-600">Pickup: Spencer St, CBD</p>
                <p className="text-sm text-slate-600">Status: Owner preparing vehicle</p>
                <p className="text-sm text-blue-700 font-semibold mt-1">ETA: Ready in 18 mins</p>
              </div>
              <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                <div className="mb-3"><VehicleVisual vehicle={selectedVehicle} compact /></div>
                <p className="font-semibold text-sm mb-3">Status Timeline</p>
                {['Booking confirmed', 'Owner preparing vehicle', 'Vehicle ready for pickup'].map((item, idx) => (
                  <div key={item} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className={`mt-1 h-3 w-3 rounded-full ${idx <= trackingStep ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <p className={`text-sm ${idx <= trackingStep ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{item}</p>
                  </div>
                ))}
              </div>
              <button onClick={resetToHome} className="w-full mt-4 rounded-xl border border-slate-300 bg-white py-3 font-semibold">Return Home</button>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
