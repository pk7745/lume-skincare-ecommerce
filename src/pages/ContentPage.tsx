import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Leaf,
  Mail,
  ShieldCheck,
  Truck,
  BookOpen,
  HelpCircle,
  FileText,
  Lock,
  CheckCircle2,
  Send,
  ArrowRight,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

type SectionKey =
  | 'story'
  | 'sustainability'
  | 'contact'
  | 'ingredients'
  | 'journal'
  | 'shipping'
  | 'help'
  | 'privacy'
  | 'terms';

const SECTIONS: Record<SectionKey, { title: string; subtitle: string; icon: any }> = {
  story: {
    title: 'Our Story',
    subtitle: 'Cultivating radiant skin through botanical wisdom and clinical purity.',
    icon: Sparkles,
  },
  sustainability: {
    title: 'Sustainability & Planet First',
    subtitle: 'Zero-waste packaging, ethical sourcing, and carbon-neutral fulfillment.',
    icon: Leaf,
  },
  contact: {
    title: 'Contact Concierge',
    subtitle: 'We are here to assist with personalized skincare guidance and order inquiries.',
    icon: Mail,
  },
  ingredients: {
    title: 'Botanical Ingredients Library',
    subtitle: 'Clean, cold-pressed, bio-compatible actives with zero synthetic fillers.',
    icon: ShieldCheck,
  },
  journal: {
    title: 'The LUMÉ Journal',
    subtitle: 'Editorial insights, seasonal rituals, and dermatologist-backed skincare education.',
    icon: BookOpen,
  },
  shipping: {
    title: 'Shipping & Returns',
    subtitle: 'Complimentary shipping over ₹1,500 and seamless 30-day returns.',
    icon: Truck,
  },
  help: {
    title: 'Help Center & FAQ',
    subtitle: 'Instant answers to your most frequently asked questions.',
    icon: HelpCircle,
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we respect, protect, and encrypt your personal data.',
    icon: Lock,
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Guidelines governing the use of LUMÉ services and digital storefront.',
    icon: FileText,
  },
};

export function ContentPage() {
  const location = useLocation();
  const pathKey = (location.pathname.replace('/', '') as SectionKey) || 'story';
  const activeSection: SectionKey = SECTIONS[pathKey] ? pathKey : 'story';

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Skincare Consultation', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: 'Skincare Consultation', message: '' });
    }, 500);
  };

  const { title, subtitle } = SECTIONS[activeSection];

  return (
    <div className="pt-24 pb-20">
      {/* Header Banner */}
      <div className="bg-sand-100 border-b border-ink-100 py-16">
        <div className="container-page text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-clay-600">
            LUMÉ Editorial & Assistance
          </span>
          <h1 className="mt-3 font-display text-4xl text-ink-900 sm:text-5xl">{title}</h1>
          <p className="mt-3 mx-auto max-w-xl text-sm text-ink-600 sm:text-base">{subtitle}</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container-page mt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                Navigation
              </h3>
              <nav className="space-y-1">
                {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
                  const Icon = SECTIONS[key].icon;
                  const isActive = activeSection === key;
                  return (
                    <Link
                      key={key}
                      to={`/${key}`}
                      className={`flex items-center gap-3 rounded-token px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-ink-900 text-sand-50 shadow-soft'
                          : 'text-ink-700 hover:bg-sand-100 hover:text-ink-900'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-clay-400' : 'text-ink-400'} />
                      <span>{SECTIONS[key].title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Dynamic Content Pane */}
          <div className="lg:col-span-3">
            {/* OUR STORY */}
            {activeSection === 'story' && (
              <div className="space-y-8 text-ink-800 leading-relaxed">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">The LUMÉ Botanical Philosophy</h2>
                  <p className="mt-4 text-sm sm:text-base text-ink-700">
                    Founded in 2026, LUMÉ emerged from a singular conviction: skin thrives best when nourished by bio-compatible, cold-pressed botanicals formulated in perfect harmony with modern dermatological science.
                  </p>
                  <p className="mt-4 text-sm sm:text-base text-ink-700">
                    We distill pure, ethically harvested plant extracts—from wild rosehip and squalane to blue tansy and fermented green tea—into lightweight, high-potency elixirs engineered to restore and protect the natural moisture barrier.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="rounded-token border border-ink-100 bg-sand-50 p-6 text-center">
                    <Sparkles className="mx-auto text-clay-600 mb-3" size={24} />
                    <h3 className="font-display text-base font-semibold text-ink-900">Cold-Pressed Actives</h3>
                    <p className="mt-2 text-xs text-ink-600">Extracted without harsh thermal processing to preserve vital phytonutrients.</p>
                  </div>
                  <div className="rounded-token border border-ink-100 bg-sand-50 p-6 text-center">
                    <ShieldCheck className="mx-auto text-clay-600 mb-3" size={24} />
                    <h3 className="font-display text-base font-semibold text-ink-900">Dermatologist Verified</h3>
                    <p className="mt-2 text-xs text-ink-600">Clinically tested for high skin compatibility, hypoallergenic, and non-comedogenic.</p>
                  </div>
                  <div className="rounded-token border border-ink-100 bg-sand-50 p-6 text-center">
                    <Leaf className="mx-auto text-clay-600 mb-3" size={24} />
                    <h3 className="font-display text-base font-semibold text-ink-900">Ethical Sourcing</h3>
                    <p className="mt-2 text-xs text-ink-600">Sourced from certified organic co-ops and sustainable botanical reserves.</p>
                  </div>
                </div>

                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h3 className="font-display text-xl text-ink-900">Our Quality Commitment</h3>
                  <ul className="mt-4 space-y-3 text-sm text-ink-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-sage-600" />
                      <span>100% Free from synthetic fragrance, parabens, sulfates, and mineral oils.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-sage-600" />
                      <span>Cruelty-free certified — never tested on animals at any stage of development.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-sage-600" />
                      <span>Small-batch artisanal production in micro-lots to maintain peak bio-activity.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SUSTAINABILITY */}
            {activeSection === 'sustainability' && (
              <div className="space-y-8 text-ink-800 leading-relaxed">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">Planet-First Skincare</h2>
                  <p className="mt-4 text-sm sm:text-base text-ink-700">
                    We believe luxury skincare should never come at the expense of our planet. From vessel design to supply chain logistics, every decision is guided by ecological responsibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-800">
                        <Leaf size={20} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink-900">100% Recyclable Glass</h3>
                    </div>
                    <p className="mt-3 text-sm text-ink-600">
                      All serums, cleansers, and creams are housed in violet glass bottles that shield light while eliminating single-use plastics.
                    </p>
                  </div>

                  <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-100 text-clay-800">
                        <Truck size={20} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink-900">Carbon-Neutral Delivery</h3>
                    </div>
                    <p className="mt-3 text-sm text-ink-600">
                      We offset 100% of carbon emissions from shipping via accredited reforestation projects and eco-friendly mailers.
                    </p>
                  </div>
                </div>

                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h3 className="font-display text-xl text-ink-900">Refill & Recycling Program</h3>
                  <p className="mt-2 text-sm text-ink-600">
                    Return 4 empty glass containers using our prepaid recycling shipping label to receive ₹500 off your next order.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-clay-600 hover:text-clay-800"
                  >
                    <span>Request Prepaid Return Label</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* CONTACT */}
            {activeSection === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">Send Us a Message</h2>
                  <p className="mt-2 text-sm text-ink-600">
                    Have questions about your skincare routine, order status, or ingredient compatibility? Fill out the form below and our botanical experts will respond within 24 hours.
                  </p>

                  {contactSubmitted ? (
                    <div className="mt-6 rounded-token border border-sage-200 bg-sage-50 p-6 text-center">
                      <CheckCircle2 className="mx-auto text-sage-600 mb-2" size={32} />
                      <h3 className="font-display text-lg font-semibold text-sage-900">Message Received!</h3>
                      <p className="mt-1 text-xs text-sage-700">
                        Thank you for reaching out to LUMÉ. A skincare specialist will contact you at {formData.email || 'your email'} shortly.
                      </p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="mt-4 text-xs font-semibold uppercase tracking-wider text-sage-800 underline hover:text-sage-900"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ink-700 uppercase mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Aditi Sharma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-11 w-full rounded-token border border-ink-200 bg-sand-100 px-3 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink-700 uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="aditi@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11 w-full rounded-token border border-ink-200 bg-sand-100 px-3 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink-700 uppercase mb-1">Inquiry Subject</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="h-11 w-full rounded-token border border-ink-200 bg-sand-100 px-3 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
                        >
                          <option value="Skincare Consultation">Personalized Skincare Consultation</option>
                          <option value="Order Status">Order Status & Tracking</option>
                          <option value="Returns & Exchanges">Returns & Refunds</option>
                          <option value="Ingredient Inquiry">Ingredient & Allergy Inquiry</option>
                          <option value="Press & Wholesale">Press & Wholesale Partnerships</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink-700 uppercase mb-1">Message</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="How can we assist your skin ritual today?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full rounded-token border border-ink-200 bg-sand-100 p-3 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-token bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-sand-50 hover:bg-ink-800 transition-colors"
                      >
                        <Send size={14} />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
                    <h3 className="font-display text-lg font-semibold text-ink-900">Direct Contact</h3>
                    <div className="mt-4 space-y-3 text-xs text-ink-700">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-clay-600" />
                        <span>concierge@lumeskincare.com</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-clay-600" />
                        <span>+91 (800) 586-3752</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-clay-600 mt-0.5" />
                        <span>LUMÉ Botanical Labs, 42 Heritage Way, Mumbai, Maharashtra 400001</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-clay-600" />
                        <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INGREDIENTS */}
            {activeSection === 'ingredients' && (
              <div className="space-y-6">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">Ingredient Transparency</h2>
                  <p className="mt-2 text-sm text-ink-600">
                    We formulate exclusively with clinical-grade botanical oils, plant adaptogens, and bio-compatible lipids.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Cold-Pressed Rosehip Oil', key: 'Vitamin A & Essential Fatty Acids', desc: 'Promotes cellular regeneration and repairs post-acne texture.' },
                    { name: 'Sugarcane Squalane (100%)', key: 'Bio-Identical Hydration', desc: 'Mimics skin’s natural sebum to seal hydration without clogging pores.' },
                    { name: 'Bakuchiol (Natural Retinol)', key: 'Cellular Turnover', desc: 'Natural plant alternative to retinol that reduces fine lines without redness or peeling.' },
                    { name: 'Triple Weight Hyaluronic Acid', key: 'Multi-Depth Moisture', desc: 'Attracts 1000x its weight in water to plump epidermis and dermal layers.' },
                    { name: 'Niacinamide (Vitamin B3 5%)', key: 'Barrier Support & Pore Control', desc: 'Strengthens moisture barrier while regulating oil production and tone.' },
                    { name: 'Blue Tansy Essential Oil', key: 'Calming Chamazulene', desc: 'Soothes reactive skin and reduces redness instantly.' },
                  ].map((ing, i) => (
                    <div key={i} className="rounded-token border border-ink-100 bg-sand-50 p-5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-clay-600">{ing.key}</span>
                      <h4 className="font-display text-base font-semibold text-ink-900 mt-1">{ing.name}</h4>
                      <p className="mt-2 text-xs text-ink-600">{ing.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JOURNAL */}
            {activeSection === 'journal' && (
              <div className="space-y-6">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">The LUMÉ Journal</h2>
                  <p className="mt-2 text-sm text-ink-600">Read the latest skincare science, barrier repair guides, and seasonal botanical rituals.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { date: 'Aug 14, 2026', title: 'The Barrier Repair Masterclass: Restoring Dehydrated Skin', read: '5 min read', desc: 'Why harsh active overuse disrupts the lipid mantle and how cold-pressed squalane repairs skin resilience.' },
                    { date: 'Jul 28, 2026', title: 'Bakuchiol vs. Retinol: The Gentle Botanical Revolution', read: '4 min read', desc: 'Discover how plant-derived Bakuchiol provides cellular smoothing without photosensitivity.' },
                    { date: 'Jul 10, 2026', title: 'Morning vs. Evening Skincare Rituals: A Dermatologist Guide', read: '6 min read', desc: 'Optimize daytime environmental protection and overnight bio-repair cycles.' },
                  ].map((art, idx) => (
                    <div key={idx} className="rounded-token border border-ink-100 bg-sand-50 p-6 hover:shadow-soft transition-shadow">
                      <div className="flex items-center gap-3 text-xs text-ink-400">
                        <span>{art.date}</span>
                        <span>•</span>
                        <span>{art.read}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink-900 mt-2">{art.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-ink-600">{art.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHIPPING */}
            {activeSection === 'shipping' && (
              <div className="space-y-6">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">Shipping & Return Policies</h2>
                  <p className="mt-2 text-sm text-ink-600">Fast, eco-friendly delivery and 30-day risk-free returns.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-token border border-ink-100 bg-sand-50 p-6">
                    <h3 className="font-display text-lg font-semibold text-ink-900">Standard Shipping</h3>
                    <p className="mt-2 text-xs text-ink-600">Free on orders over ₹1,500. Flat rate ₹150 for orders below ₹1,500. Delivered in 2–4 business days.</p>
                  </div>
                  <div className="rounded-token border border-ink-100 bg-sand-50 p-6">
                    <h3 className="font-display text-lg font-semibold text-ink-900">30-Day Happiness Guarantee</h3>
                    <p className="mt-2 text-xs text-ink-600">If your skin does not love our formulas, return gently used items within 30 days for a full refund.</p>
                  </div>
                </div>
              </div>
            )}

            {/* HELP */}
            {activeSection === 'help' && (
              <div className="space-y-6">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8">
                  <h2 className="font-display text-2xl text-ink-900">Frequently Asked Questions</h2>
                  <p className="mt-2 text-sm text-ink-600">Find quick answers to common order, shipping, and skincare questions.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { q: 'Are LUMÉ products suitable for sensitive skin?', a: 'Yes! All LUMÉ products are non-comedogenic, dermatologist-tested, and free from artificial fragrances or harsh alcohols.' },
                    { q: 'How long will one bottle of serum last?', a: 'Used twice daily (3–4 drops per application), one 30ml serum bottle lasts approximately 60 to 75 days.' },
                    { q: 'Can I combine LUMÉ products with prescription retinoids?', a: 'Yes. Our Velvet Moisture Cream and Squalane Facial Oil are ideal for soothing skin during retinoid treatment.' },
                    { q: 'What promo codes are available?', a: 'Use WELCOME10 for 10% off your first order, LUME15 for 15% off orders over ₹2,000, or GLOW20 for 20% off orders over ₹3,500.' },
                  ].map((faq, index) => (
                    <div key={index} className="rounded-token border border-ink-100 bg-sand-50 p-5">
                      <h4 className="font-display text-base font-semibold text-ink-900">{faq.q}</h4>
                      <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeSection === 'privacy' && (
              <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8 space-y-4 text-xs sm:text-sm text-ink-700 leading-relaxed">
                <h2 className="font-display text-2xl text-ink-900">Privacy Policy</h2>
                <p>At LUMÉ, we respect your personal data and privacy. We utilize bank-grade AES 256-bit encryption for all transactional data and httpOnly secure cookies for authentication tokens.</p>
                <p>We will never sell, lease, or distribute your email address or personal contact details to third-party advertisers.</p>
              </div>
            )}

            {/* TERMS */}
            {activeSection === 'terms' && (
              <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-8 space-y-4 text-xs sm:text-sm text-ink-700 leading-relaxed">
                <h2 className="font-display text-2xl text-ink-900">Terms of Service</h2>
                <p>By using the LUMÉ e-commerce storefront, you agree to our standard terms regarding order fulfillment, promotional code usage, and intellectual property protection.</p>
                <p>Prices are listed in Indian Rupees (₹/INR) inclusive of applicable taxes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
