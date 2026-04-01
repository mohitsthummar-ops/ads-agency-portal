import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Eye, Heart, X, ChevronDown, Loader2, Download, Tag, Users } from 'lucide-react';
import { templateAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Filter Options ────────────────────────────────────────────────────────────
const IMAGE_STYLES = ['All Styles', 'Instagram Post', 'Facebook Banner', 'Poster', 'Story Size', 'YouTube Thumbnail', 'Minimalist', 'Bold & Vibrant', 'Elegant', 'Retro', 'Futuristic', 'Playful', 'Corporate'];
const AUDIENCES = ['All Audiences', 'Gen Z', 'Millennials', 'Professionals', 'Parents', 'Students', 'Seniors', 'Entrepreneurs'];
const INDUSTRIES = ['All Industries', 'E-Commerce', 'Food & Beverage', 'Tech & SaaS', 'Fashion', 'Health & Fitness', 'Finance', 'Travel', 'Education'];
const AD_FORMATS = ['All Formats', 'Social Media Post', 'Story / Reel', 'Banner Ad', 'Email Header', 'Billboard', 'Product Card'];
const PLATFORMS = ['All Platforms', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok', 'Google Ads', 'YouTube'];

// ─── Image Fallback Component ───────────────────────────────────────────────────
function SafeImage({ src, alt, className, emoji }) {
    const [error, setError] = useState(false);

    // Resolve backend URL for local uploads
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const fullSrc = src?.startsWith('/uploads') ? `${BACKEND_URL}${src}` : src;

    if (!src || error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
                <span className="text-4xl drop-shadow-md">{emoji || '✨'}</span>
            </div>
        );
    }
    return (
        <img
            src={fullSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}

// ─── FilterPill Component (Original UI) ─────────────────────────────────────────
function FilterSelect({ label, options, value, onChange, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const isActive = value !== options[0];

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
            >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {isActive ? value : label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full mt-2 left-0 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-w-[180px]"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Preview Modal (New Functionality) ──────────────────────────────────────────
function PreviewModal({ template, onClose, onUse }) {
    if (!template) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
            >
                {/* Left: Visual Side */}
                <div className="md:w-1/2 relative bg-slate-100 min-h-[300px] flex items-center justify-center overflow-hidden">
                    <SafeImage
                        src={template.imageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover"
                        emoji={template.emoji}
                    />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                            {template.platform}
                        </span>
                    </div>
                </div>

                {/* Right: Info Side */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-1">{template.title}</h2>
                            <p className="text-sm font-medium text-blue-600">{template.industry}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Target Audience
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{template.audience || 'General'}</p>
                        </div>

                        {template.offerDetails && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" /> Offer Details
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">{template.offerDetails}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onUse}
                            className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Use Template
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Template Card (Original UI) ───────────────────────────────────────────────
function TemplateCard({ template, index, onPreview, onUse }) {
    const [liked, setLiked] = useState(false);

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
        >
            {/* Visual Preview */}
            <div className="relative h-44 flex flex-col items-center justify-center overflow-hidden bg-slate-100">
                <SafeImage
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    emoji={template.emoji}
                />

                {/* Platform badge */}
                <span className="z-10 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                    {template.platform}
                </span>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-20">
                    <button onClick={() => onPreview(template)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-800 text-xs font-semibold hover:bg-blue-50 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => onUse(template)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Use
                    </button>
                </div>

                {/* Like button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
                >
                    <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-400 text-red-400 scale-110' : 'text-white'}`} />
                </button>
            </div>

            {/* Card Body */}
            <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-sm mb-1 truncate">{template.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">{template.industry}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500">{template.audience}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page (Original UI Layout) ───────────────────────────────────────────
export default function CampaignTemplates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const [search, setSearch] = useState('');
    const [style, setStyle] = useState(IMAGE_STYLES[0]);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    const [industry, setIndustry] = useState(INDUSTRIES[0]);
    const [format, setFormat] = useState(AD_FORMATS[0]);
    const [platform, setPlatform] = useState(PLATFORMS[0]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await templateAPI.getAll();
                setTemplates(res.data.templates || []);
            } catch (err) {
                toast.error('Failed to load templates');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleUse = (template) => {
        navigate('/dashboard/request-ad', {
            state: {
                prefill: {
                    title: template.title,
                    industry: template.industry,
                    audience: template.audience,
                    description: template.description || template.title,
                    offerDetails: template.offerDetails,
                    imageStyle: template.imageStyle || 'Instagram Post',
                    platform: template.platform
                }
            }
        });
    };

    const hasActiveFilters =
        style !== IMAGE_STYLES[0] ||
        audience !== AUDIENCES[0] ||
        industry !== INDUSTRIES[0] ||
        format !== AD_FORMATS[0] ||
        platform !== PLATFORMS[0] ||
        search !== '';

    const clearFilters = () => {
        setStyle(IMAGE_STYLES[0]);
        setAudience(AUDIENCES[0]);
        setIndustry(INDUSTRIES[0]);
        setFormat(AD_FORMATS[0]);
        setPlatform(PLATFORMS[0]);
        setSearch('');
    };

    const filtered = useMemo(() => {
        return templates.filter((t) => {
            if (style !== IMAGE_STYLES[0] && t.imageStyle !== style) return false;
            if (audience !== AUDIENCES[0] && t.audience !== audience) return false;
            if (industry !== INDUSTRIES[0] && t.industry !== industry) return false;
            if (platform !== PLATFORMS[0] && t.platform !== platform) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    t.title.toLowerCase().includes(q) ||
                    t.industry.toLowerCase().includes(q) ||
                    t.audience.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [templates, style, audience, industry, platform, search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* ── Hero Section (Restored) ── */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 pt-10 pb-14 px-4 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-5"
                    >
                        <Sparkles className="w-4 h-4" />
                        Professional Templates Ready
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
                    >
                        Campaign <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Templates</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-blue-200 text-lg max-w-2xl mx-auto"
                    >
                        Browse our library of professionally crafted ad templates. Filter by style, audience, industry, and more to find your perfect match.
                    </motion.p>
                </div>
            </div>

            {/* ── Sticky Filter Bar (Restored) ── */}
            <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
                        <div className="relative flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search templates…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-44 transition-all"
                            />
                        </div>
                        <div className="w-px h-6 bg-slate-200 flex-shrink-0" />
                        <FilterSelect label="Image Style" options={IMAGE_STYLES} value={style} onChange={setStyle} icon={SlidersHorizontal} />
                        <FilterSelect label="Target Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
                        <FilterSelect label="Industry" options={INDUSTRIES} value={industry} onChange={setIndustry} />
                        <FilterSelect label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={clearFilters}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                                >
                                    <X className="w-3.5 h-3.5" /> Clear
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[50vh]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-slate-500 font-medium">Fetching best templates...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                        variants={{
                            visible: { transition: { staggerChildren: 0.08 } }
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {filtered.map((template, i) => (
                                <TemplateCard
                                    key={template._id}
                                    template={template}
                                    index={i}
                                    onPreview={setPreviewTemplate}
                                    onUse={handleUse}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No templates found</h3>
                        <p className="text-slate-400 mb-6">Try adjusting your filters or search term</p>
                        <button onClick={clearFilters} className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Clear all filters</button>
                    </div>
                )}
            </div>

            {/* ── Preview Modal ── */}
            <AnimatePresence>
                {previewTemplate && (
                    <PreviewModal
                        template={previewTemplate}
                        onClose={() => setPreviewTemplate(null)}
                        onUse={(t) => {
                            setPreviewTemplate(null);
                            handleUse(t);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── CTA Banner ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-12 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="absolute rounded-full border-2 border-white" style={{ width: `${200 + i * 120}px`, height: `${200 + i * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                        ))}
                    </div>
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">✨</div>
                        <h2 className="text-3xl font-extrabold text-white mb-3">Can't find what you need?</h2>
                        <p className="text-blue-200 text-lg mb-7">Let our AI generate a custom ad campaign tailored exactly to your brand.</p>
                        <button onClick={() => navigate('/dashboard/request-ad')} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-colors shadow-lg">
                            <Sparkles className="w-5 h-5" /> Create Custom Ad
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
