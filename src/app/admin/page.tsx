'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    getSiteConfig,
    updateSiteConfig,
    SiteConfig,
    defaultConfig,
    Project,
    getProjects,
    addProject,
    updateProject,
    deleteProject,
    Friend,
    getFriends,
    addFriend,
    updateFriend,
    deleteFriend,
} from '@/lib/firebase/siteConfig';
import {
    Settings,
    Palette,
    Type,
    Gamepad2,
    Link as LinkIcon,
    Save,
    Loader2,
    Check,
    RefreshCw,
    Eye,
    FolderKanban,
    Plus,
    Trash2,
    Edit3,
    X,
    Users,
    Upload,
} from 'lucide-react';
import { uploadImage } from '@/lib/firebase/storage';

type TabType = 'general' | 'colors' | 'content' | 'projects' | 'friends' | 'games' | 'social';

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminContent />
        </ProtectedRoute>
    );
}

function AdminContent() {
    const { user } = useAuth();
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load config on mount
    useEffect(() => {
        const loadConfig = async () => {
            const siteConfig = await getSiteConfig();
            setConfig(siteConfig);
            setIsLoading(false);
        };
        loadConfig();
    }, []);

    // Handle config changes
    const updateConfig = (updates: Partial<SiteConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
        setHasChanges(true);
        setSaveSuccess(false);
    };

    // Handle nested config changes
    const updateNestedConfig = <K extends keyof SiteConfig>(
        key: K,
        updates: Partial<SiteConfig[K]>
    ) => {
        setConfig((prev) => ({
            ...prev,
            [key]: { ...(prev[key] as object), ...updates },
        }));
        setHasChanges(true);
        setSaveSuccess(false);
    };

    // Save config
    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            await updateSiteConfig(config, user.uid);
            setSaveSuccess(true);
            setHasChanges(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Reset to defaults
    const handleReset = () => {
        setConfig(defaultConfig);
        setHasChanges(true);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'content', label: 'Content', icon: Type },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'friends', label: 'Friends', icon: Users },
        { id: 'games', label: 'Arcade', icon: Gamepad2 },
        { id: 'social', label: 'Social', icon: LinkIcon },
    ] as const;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">
                            Configure your portfolio settings
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"
                        >
                            <RefreshCw size={18} />
                            Reset
                        </button>

                        <a
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"
                        >
                            <Eye size={18} />
                            Preview
                        </a>

                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${saveSuccess
                                ? 'bg-green-600 text-white'
                                : hasChanges
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : saveSuccess ? (
                                <Check size={18} />
                            ) : (
                                <Save size={18} />
                            )}
                            {saveSuccess ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Tabs and Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <nav className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                        >
                            {activeTab === 'general' && (
                                <GeneralTab config={config} updateConfig={updateConfig} />
                            )}
                            {activeTab === 'colors' && (
                                <ColorsTab
                                    colors={config.colors}
                                    updateColors={(colors) => updateNestedConfig('colors', colors)}
                                />
                            )}
                            {activeTab === 'content' && (
                                <ContentTab
                                    config={config}
                                    updateHero={(hero) => updateNestedConfig('hero', hero)}
                                    updateAbout={(about) => updateNestedConfig('about', about)}
                                    updateProjects={(projects) => updateNestedConfig('projects', projects)}
                                    updateFriends={(friends) => updateNestedConfig('friends', friends)}
                                    updateContact={(contact) => updateNestedConfig('contact', contact)}
                                />
                            )}
                            {activeTab === 'projects' && (
                                <ProjectsTab />
                            )}
                            {activeTab === 'friends' && (
                                <FriendsTab />
                            )}
                            {activeTab === 'games' && (
                                <GamesTab
                                    settings={config.gameSettings}
                                    updateSettings={(settings) =>
                                        updateNestedConfig('gameSettings', settings)
                                    }
                                />
                            )}
                            {activeTab === 'social' && (
                                <SocialTab
                                    links={config.socialLinks}
                                    updateLinks={(links) => updateNestedConfig('socialLinks', links)}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== TAB COMPONENTS ====================

function GeneralTab({
    config,
    updateConfig,
}: {
    config: SiteConfig;
    updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
    const [isUploading, setIsUploading] = useState(false);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'logos');
            updateConfig({ logoUrl: url });
        } catch (error: any) {
            console.error('Failed to upload logo:', error);
            alert(`Failed to upload logo: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Site Name
                    </label>
                    <input
                        type="text"
                        value={config.siteName}
                        onChange={(e) => updateConfig({ siteName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Site Description
                    </label>
                    <textarea
                        value={config.siteDescription}
                        onChange={(e) => updateConfig({ siteDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Logo URL
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="url"
                                value={config.logoUrl || ''}
                                onChange={(e) => updateConfig({ logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="logo-upload"
                                className={`flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-lg cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <Loader2 size={24} className="animate-spin text-violet-500" />
                                ) : (
                                    <Upload size={24} className="text-gray-300" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorsTab({
    colors,
    updateColors,
}: {
    colors: SiteConfig['colors'];
    updateColors: (colors: Partial<SiteConfig['colors']>) => void;
}) {
    const colorFields = [
        { key: 'primary', label: 'Primary Color', description: 'Main accent color' },
        { key: 'secondary', label: 'Secondary Color', description: 'Secondary accent' },
        { key: 'background', label: 'Background', description: 'Page background' },
        { key: 'surface', label: 'Surface', description: 'Card backgrounds' },
        { key: 'text', label: 'Text Color', description: 'Primary text' },
        { key: 'textMuted', label: 'Muted Text', description: 'Secondary text' },
    ] as const;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Color Scheme</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colorFields.map((field) => (
                    <div
                        key={field.key}
                        className="p-4 bg-white/5 rounded-lg border border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <label className="block text-sm font-medium text-white">
                                    {field.label}
                                </label>
                                <span className="text-xs text-gray-400">{field.description}</span>
                            </div>
                            <div
                                className="w-10 h-10 rounded-lg border border-gray-600 shadow-inner"
                                style={{ backgroundColor: colors[field.key] }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors[field.key]}
                                onChange={(e) => updateColors({ [field.key]: e.target.value })}
                                className="w-10 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={colors[field.key]}
                                onChange={(e) => updateColors({ [field.key]: e.target.value })}
                                className="flex-1 px-3 py-2 bg-black/30 border border-gray-700 rounded text-white font-mono text-sm focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-6 rounded-xl border border-gray-700" style={{ backgroundColor: colors.surface }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                    Preview
                </h3>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                    This is how your colors will look together.
                </p>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 rounded-lg font-medium text-white"
                        style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                    >
                        Primary Button
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg font-medium border"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                        Secondary Button
                    </button>
                </div>
            </div>
        </div>
    );
}

function ContentTab({
    config,
    updateHero,
    updateAbout,
    updateProjects,
    updateFriends,
    updateContact,
}: {
    config: SiteConfig;
    updateHero: (hero: Partial<SiteConfig['hero']>) => void;
    updateAbout: (about: Partial<SiteConfig['about']>) => void;
    updateProjects: (projects: Partial<SiteConfig['projects']>) => void;
    updateFriends: (friends: Partial<SiteConfig['friends']>) => void;
    updateContact: (contact: Partial<SiteConfig['contact']>) => void;
}) {
    const [newSkill, setNewSkill] = useState('');

    const addSkill = () => {
        if (newSkill.trim()) {
            updateAbout({ skills: [...config.about.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (index: number) => {
        updateAbout({ skills: config.about.skills.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Hero Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tagline (small text above title)
                        </label>
                        <input
                            type="text"
                            value={config.hero.tagline || ''}
                            onChange={(e) => updateHero({ tagline: e.target.value })}
                            placeholder="e.g., System Architect & Full Stack Engineer"
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={config.hero.title}
                                onChange={(e) => updateHero({ title: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Title Highlight (colored text)
                            </label>
                            <input
                                type="text"
                                value={config.hero.titleHighlight || ''}
                                onChange={(e) => updateHero({ titleHighlight: e.target.value })}
                                placeholder="e.g., That Scale"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subtitle
                        </label>
                        <textarea
                            value={config.hero.subtitle}
                            onChange={(e) => updateHero({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Primary CTA Button Text
                            </label>
                            <input
                                type="text"
                                value={config.hero.ctaText}
                                onChange={(e) => updateHero({ ctaText: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Primary CTA Link
                            </label>
                            <input
                                type="text"
                                value={config.hero.ctaLink}
                                onChange={(e) => updateHero({ ctaLink: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Secondary CTA Button Text
                            </label>
                            <input
                                type="text"
                                value={config.hero.secondaryCtaText || ''}
                                onChange={(e) => updateHero({ secondaryCtaText: e.target.value })}
                                placeholder="e.g., Enter Arcade"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Secondary CTA Link
                            </label>
                            <input
                                type="text"
                                value={config.hero.secondaryCtaLink || ''}
                                onChange={(e) => updateHero({ secondaryCtaLink: e.target.value })}
                                placeholder="e.g., /arcade"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">About Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            About Title
                        </label>
                        <input
                            type="text"
                            value={config.about.title}
                            onChange={(e) => updateAbout({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={config.about.description}
                            onChange={(e) => updateAbout({ description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Skills Label
                        </label>
                        <input
                            type="text"
                            value={config.about.skillsLabel || 'Core Competencies'}
                            onChange={(e) => updateAbout({ skillsLabel: e.target.value })}
                            placeholder="e.g., Core Competencies"
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {config.about.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm"
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(index)}
                                        className="ml-1 hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                placeholder="Add a skill..."
                                className="flex-1 px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                            <button
                                onClick={addSkill}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Projects Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.projects?.title || 'Featured Projects'}
                            onChange={(e) => updateProjects({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.projects?.subtitle || ''}
                            onChange={(e) => updateProjects({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                        />
                    </div>
                    <p className="text-sm text-gray-400">
                        To manage individual projects, go to the <strong>Projects</strong> tab.
                    </p>
                </div>
            </div>

            {/* Friends Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Friends Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.friends?.title || 'Cool People I Know'}
                            onChange={(e) => updateFriends({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.friends?.subtitle || ''}
                            onChange={(e) => updateFriends({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                        />
                    </div>
                    <p className="text-sm text-gray-400">
                        To manage individual friends, go to the <strong>Friends</strong> tab.
                    </p>
                </div>
            </div>

            {/* Contact Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Contact Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contact Title
                        </label>
                        <input
                            type="text"
                            value={config.contact?.title || 'Ready to collaborate?'}
                            onChange={(e) => updateContact({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectsTab() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
        setLoading(false);
    };

    const handleAddProject = async (project: Omit<Project, 'id'>) => {
        await addProject(project);
        await loadProjects();
        setIsAdding(false);
    };

    const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
        await updateProject(id, updates);
        await loadProjects();
        setEditingProject(null);
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(id);
            await loadProjects();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Projects</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Project
                </button>
            </div>

            {isAdding && (
                <ProjectForm
                    onSubmit={handleAddProject}
                    onCancel={() => setIsAdding(false)}
                />
            )}

            {editingProject && (
                <ProjectForm
                    project={editingProject}
                    onSubmit={(updates) => handleUpdateProject(editingProject.id!, updates)}
                    onCancel={() => setEditingProject(null)}
                />
            )}

            <div className="space-y-4">
                {projects.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No projects yet. Add your first project!
                    </p>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 bg-white/5 rounded-lg border border-gray-700 flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-medium text-white">{project.title}</h3>
                                <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
                                <div className="flex gap-2 mt-2">
                                    {project.featured && (
                                        <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">Featured</span>
                                    )}
                                    <span className="text-xs text-gray-500">Order: {project.order}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingProject(project)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteProject(project.id!)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function ProjectForm({
    project,
    onSubmit,
    onCancel,
}: {
    project?: Project;
    onSubmit: (project: Omit<Project, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Project, 'id'>>({
        title: project?.title || '',
        description: project?.description || '',
        tags: project?.tags || [],
        demoUrl: project?.demoUrl || '',
        githubUrl: project?.githubUrl || '',
        imageUrl: project?.imageUrl || '',
        order: project?.order || 0,
        featured: project?.featured ?? true,
    });
    const [newTag, setNewTag] = useState('');

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
    };

    return (
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{project ? 'Edit Project' : 'Add New Project'}</h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Demo URL</label>
                    <input
                        type="url"
                        value={formData.demoUrl}
                        onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">GitHub URL</label>
                    <input
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-sm">
                            {tag}
                            <button onClick={() => removeTag(index)} className="hover:text-red-400">×</button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                    <button onClick={addTag} className="px-3 py-2 bg-violet-600 text-white rounded-lg">Add</button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-white/5 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-300">Featured on home page</span>
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">
                    Cancel
                </button>
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                >
                    {project ? 'Save Changes' : 'Add Project'}
                </button>
            </div>
        </div>
    );
}

function FriendsTab() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        const fetchedFriends = await getFriends();
        setFriends(fetchedFriends);
        setLoading(false);
    };

    const handleAddFriend = async (friend: Omit<Friend, 'id'>) => {
        await addFriend(friend);
        await loadFriends();
        setIsAdding(false);
    };

    const handleUpdateFriend = async (id: string, updates: Partial<Friend>) => {
        await updateFriend(id, updates);
        await loadFriends();
        setEditingFriend(null);
    };

    const handleDeleteFriend = async (id: string) => {
        if (confirm('Are you sure you want to remove this friend?')) {
            await deleteFriend(id);
            await loadFriends();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Manage Friends</h2>
                    <p className="text-sm text-gray-400">Add cool people you know to your portfolio</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Friend
                </button>
            </div>

            {isAdding && (
                <FriendForm
                    onSubmit={handleAddFriend}
                    onCancel={() => setIsAdding(false)}
                />
            )}

            {editingFriend && (
                <FriendForm
                    friend={editingFriend}
                    onSubmit={(updates) => handleUpdateFriend(editingFriend.id!, updates)}
                    onCancel={() => setEditingFriend(null)}
                />
            )}

            <div className="space-y-4">
                {friends.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No friends added yet. Add your first friend!
                    </p>
                ) : (
                    friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="p-4 bg-white/5 rounded-lg border border-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                {friend.avatarUrl ? (
                                    <img
                                        src={friend.avatarUrl}
                                        alt={friend.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-white">{friend.name}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-1">{friend.description}</p>
                                    <span className="text-xs text-gray-500">Order: {friend.order}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingFriend(friend)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteFriend(friend.id!)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function FriendForm({
    friend,
    onSubmit,
    onCancel,
}: {
    friend?: Friend;
    onSubmit: (friend: Omit<Friend, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Friend, 'id'>>({
        name: friend?.name || '',
        description: friend?.description || '',
        avatarUrl: friend?.avatarUrl || '',
        portfolioUrl: friend?.portfolioUrl || '',
        socialLinks: friend?.socialLinks || {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            website: '',
        },
        order: friend?.order || 0,
    });

    const updateSocialLink = (key: keyof Friend['socialLinks'], value: string) => {
        setFormData({
            ...formData,
            socialLinks: { ...formData.socialLinks, [key]: value }
        });
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'avatars');
            setFormData({ ...formData, avatarUrl: url });
        } catch (error: any) {
            console.error('Failed to upload avatar:', error);
            alert(`Failed to upload avatar: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{friend ? 'Edit Friend' : 'Add New Friend'}</h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Friend's name"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="A short description about your friend"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Avatar URL</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            placeholder="https://..."
                            className="flex-1 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                                id="avatar-upload"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-lg cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <Loader2 size={20} className="animate-spin text-violet-500" />
                                ) : (
                                    <Upload size={20} className="text-gray-300" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Portfolio URL</label>
                    <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-2">Social Links</label>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="url"
                        value={formData.socialLinks.github || ''}
                        onChange={(e) => updateSocialLink('github', e.target.value)}
                        placeholder="GitHub URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.linkedin || ''}
                        onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                        placeholder="LinkedIn URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.twitter || ''}
                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                        placeholder="Twitter URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.instagram || ''}
                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                        placeholder="Instagram URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.website || ''}
                        onChange={(e) => updateSocialLink('website', e.target.value)}
                        placeholder="Website URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 col-span-2"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">
                    Cancel
                </button>
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                >
                    {friend ? 'Save Changes' : 'Add Friend'}
                </button>
            </div>
        </div>
    );
}

function GamesTab({
    settings,
    updateSettings,
}: {
    settings: SiteConfig['gameSettings'];
    updateSettings: (settings: Partial<SiteConfig['gameSettings']>) => void;
}) {
    const [activeSubTab, setActiveSubTab] = useState<'settings' | 'games'>('settings');
    const [games, setGames] = useState<Array<{ id: string; name: string; stats: { totalPlays: number; uniquePlayers: number; topScore: number | null } }>>([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [expandedGame, setExpandedGame] = useState<string | null>(null);
    const [gameConfigs, setGameConfigs] = useState<Record<string, any>>({});
    const [savingGame, setSavingGame] = useState<string | null>(null);
    const [deletingGame, setDeletingGame] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState<{ gameId: string; type: string } | null>(null);

    // Known games list
    const KNOWN_GAMES = [
        { id: 'flappy-dillu', name: 'Flappy Dillu' },
    ];

    // Load game stats and configs
    useEffect(() => {
        async function loadGamesData() {
            setLoadingGames(true);
            try {
                const { getGameStats, getGameConfig } = await import('@/lib/firebase/firestore');

                const gamesWithStats = await Promise.all(
                    KNOWN_GAMES.map(async (game) => {
                        const stats = await getGameStats(game.id);
                        const config = await getGameConfig(game.id);
                        return { ...game, stats, config };
                    })
                );

                setGames(gamesWithStats);

                const configs: Record<string, any> = {};
                gamesWithStats.forEach(g => {
                    if (g.config) {
                        configs[g.id] = g.config;
                    }
                });
                setGameConfigs(configs);
            } catch (err) {
                console.error('Failed to load game data:', err);
            } finally {
                setLoadingGames(false);
            }
        }

        if (activeSubTab === 'games') {
            loadGamesData();
        }
    }, [activeSubTab]);

    const handleSaveGameConfig = async (gameId: string, updates: any) => {
        setSavingGame(gameId);
        try {
            const { saveGameConfig } = await import('@/lib/firebase/firestore');
            await saveGameConfig(gameId, updates);
            setGameConfigs(prev => ({ ...prev, [gameId]: { ...prev[gameId], ...updates } }));
        } catch (err) {
            console.error('Failed to save game config:', err);
        } finally {
            setSavingGame(null);
        }
    };

    const handleDeleteGameData = async (gameId: string) => {
        if (!confirm(`Are you sure you want to delete ALL game data for ${gameId}? This will remove all scores and cannot be undone!`)) {
            return;
        }

        setDeletingGame(gameId);
        try {
            const { deleteGameData } = await import('@/lib/firebase/firestore');
            const count = await deleteGameData(gameId);
            alert(`Deleted ${count} game sessions.`);
            // Refresh stats
            const { getGameStats } = await import('@/lib/firebase/firestore');
            const newStats = await getGameStats(gameId);
            setGames(prev => prev.map(g => g.id === gameId ? { ...g, stats: newStats } : g));
        } catch (err) {
            console.error('Failed to delete game data:', err);
            alert('Failed to delete game data');
        } finally {
            setDeletingGame(null);
        }
    };

    const handleImageUpload = async (gameId: string, imageType: 'skillIssueImage' | 'congratsImage' | 'thumbnailImage', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage({ gameId, type: imageType });
        try {
            const url = await uploadImage(file, `games/${gameId}/${imageType}`);
            await handleSaveGameConfig(gameId, { [imageType]: url });
        } catch (err) {
            console.error('Failed to upload image:', err);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-700/50 pb-4">
                <button
                    onClick={() => setActiveSubTab('settings')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSubTab === 'settings'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    General Settings
                </button>
                <button
                    onClick={() => setActiveSubTab('games')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSubTab === 'games'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Manage Games
                </button>
            </div>

            {activeSubTab === 'settings' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Game Settings</h2>

                    <ToggleSetting
                        label="Allow Guest Play"
                        description="Allow users to play games without logging in"
                        checked={settings.allowGuestPlay}
                        onChange={(checked) => updateSettings({ allowGuestPlay: checked })}
                    />

                    <ToggleSetting
                        label="Save Guest Scores Locally"
                        description="Store guest scores in browser localStorage (not in database)"
                        checked={settings.saveGuestScoresLocally}
                        onChange={(checked) => updateSettings({ saveGuestScoresLocally: checked })}
                    />

                    <ToggleSetting
                        label="Show Leaderboard"
                        description="Display global leaderboard on game pages"
                        checked={settings.showLeaderboard}
                        onChange={(checked) => updateSettings({ showLeaderboard: checked })}
                    />

                    <ToggleSetting
                        label="Require Login for Leaderboard"
                        description="Only logged-in users can appear on the leaderboard"
                        checked={settings.requireLoginForLeaderboard}
                        onChange={(checked) => updateSettings({ requireLoginForLeaderboard: checked })}
                    />

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm">
                            <strong>Note:</strong> When guest play is enabled, guests can play games but their scores won&apos;t be saved to the database.
                        </p>
                    </div>
                </div>
            )}

            {activeSubTab === 'games' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Arcade Games</h2>

                    {loadingGames ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {games.map((game) => (
                                <div
                                    key={game.id}
                                    className="bg-black/30 border border-gray-700/50 rounded-xl overflow-hidden"
                                >
                                    {/* Game Header */}
                                    <button
                                        onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-violet-500/10">
                                                <Gamepad2 size={24} className="text-violet-400" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-white">{game.name}</h3>
                                                <p className="text-sm text-gray-400">
                                                    {game.stats.totalPlays} plays • {game.stats.uniquePlayers} players • Top: {game.stats.topScore ?? 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`transition-transform ${expandedGame === game.id ? 'rotate-180' : ''}`}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {expandedGame === game.id && (
                                        <div className="border-t border-gray-700/50 p-4 space-y-4">
                                            {/* Image Uploads */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Skill Issue Image */}
                                                <div className="p-3 bg-black/20 rounded-lg">
                                                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Skill Issue Image</label>
                                                    {gameConfigs[game.id]?.skillIssueImage ? (
                                                        <div className="relative">
                                                            <img src={gameConfigs[game.id].skillIssueImage} alt="Skill Issue" className="w-full h-24 object-cover rounded-lg" />
                                                            <button
                                                                onClick={() => handleSaveGameConfig(game.id, { skillIssueImage: null })}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'skillIssueImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'skillIssueImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-violet-400" />
                                                            ) : (
                                                                <Upload size={20} className="text-gray-500" />
                                                            )}
                                                        </label>
                                                    )}
                                                </div>

                                                {/* Congrats Image */}
                                                <div className="p-3 bg-black/20 rounded-lg">
                                                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Congrats Image</label>
                                                    {gameConfigs[game.id]?.congratsImage ? (
                                                        <div className="relative">
                                                            <img src={gameConfigs[game.id].congratsImage} alt="Congrats" className="w-full h-24 object-cover rounded-lg" />
                                                            <button
                                                                onClick={() => handleSaveGameConfig(game.id, { congratsImage: null })}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'congratsImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'congratsImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-violet-400" />
                                                            ) : (
                                                                <Upload size={20} className="text-gray-500" />
                                                            )}
                                                        </label>
                                                    )}
                                                </div>

                                                {/* Thumbnail Image */}
                                                <div className="p-3 bg-black/20 rounded-lg">
                                                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Thumbnail</label>
                                                    {gameConfigs[game.id]?.thumbnailImage ? (
                                                        <div className="relative">
                                                            <img src={gameConfigs[game.id].thumbnailImage} alt="Thumbnail" className="w-full h-24 object-cover rounded-lg" />
                                                            <button
                                                                onClick={() => handleSaveGameConfig(game.id, { thumbnailImage: null })}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'thumbnailImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'thumbnailImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-violet-400" />
                                                            ) : (
                                                                <Upload size={20} className="text-gray-500" />
                                                            )}
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Settings */}
                                            <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                                                <label className="text-sm text-gray-300">Min Score for Congrats:</label>
                                                <input
                                                    type="number"
                                                    value={gameConfigs[game.id]?.minScoreForCongrats || 10}
                                                    onChange={(e) => handleSaveGameConfig(game.id, { minScoreForCongrats: parseInt(e.target.value) || 10 })}
                                                    className="w-24 px-3 py-2 bg-black/40 border border-gray-600 rounded-lg text-white"
                                                />
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="border-t border-red-500/30 pt-4 mt-4">
                                                <h4 className="text-red-400 font-bold text-sm mb-2">Danger Zone</h4>
                                                <button
                                                    onClick={() => handleDeleteGameData(game.id)}
                                                    disabled={deletingGame === game.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-all disabled:opacity-50"
                                                >
                                                    {deletingGame === game.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                    Delete All Game Data
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SocialTab({
    links,
    updateLinks,
}: {
    links: SiteConfig['socialLinks'];
    updateLinks: (links: Partial<SiteConfig['socialLinks']>) => void;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Social Links</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        GitHub URL
                    </label>
                    <input
                        type="url"
                        value={links.github || ''}
                        onChange={(e) => updateLinks({ github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        LinkedIn URL
                    </label>
                    <input
                        type="url"
                        value={links.linkedin || ''}
                        onChange={(e) => updateLinks({ linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Twitter/X URL
                    </label>
                    <input
                        type="url"
                        value={links.twitter || ''}
                        onChange={(e) => updateLinks({ twitter: e.target.value })}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Instagram URL
                    </label>
                    <input
                        type="url"
                        value={links.instagram || ''}
                        onChange={(e) => updateLinks({ instagram: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={links.email || ''}
                        onChange={(e) => updateLinks({ email: e.target.value })}
                        placeholder="hello@example.com"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>
        </div>
    );
}

// Toggle Component
function ToggleSetting({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700">
            <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-700'
                    }`}
            >
                <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ left: checked ? 28 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );
}
