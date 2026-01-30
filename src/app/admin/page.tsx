'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
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
    Experience,
    getExperience,
    addExperience,
    updateExperience,
    deleteExperience,
    Education,
    getEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    Achievement,
    getAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    Service,
    getServices,
    addService,
    updateService,
    deleteService,
} from '@/lib/firebase/siteConfig';
import { getAllUsers } from '@/lib/firebase/firestore';
import { updateUserRole, UserRole } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
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
    Briefcase,
    GraduationCap,
    Trophy,
    Layout,
    GripVertical,
    MoveUp,
    MoveDown,
    EyeOff,
} from 'lucide-react';
import { uploadImage } from '@/lib/firebase/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatDuration } from '@/lib/utils';

type TabType = 'general' | 'colors' | 'layout' | 'content' | 'projects' | 'experience' | 'academic' | 'achievements' | 'services' | 'friends' | 'games' | 'social' | 'users';

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin" loadingFallback={<DashboardSkeleton />}>
            <AdminContent />
        </ProtectedRoute>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48 opacity-50" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-2 space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
                            <TabSkeleton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
        } catch (error: unknown) {
            console.error('Failed to save config:', error);
        } finally {
            setIsSaving(false);
        }
    };


    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'layout', label: 'Layout', icon: Layout },
        { id: 'content', label: 'Content', icon: Type },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'services', label: 'Services', icon: Layout },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'friends', label: 'Friends', icon: Users },
        { id: 'games', label: 'Arcade', icon: Gamepad2 },
        { id: 'social', label: 'Social', icon: LinkIcon },
        { id: 'users', label: 'Users', icon: Users },
    ] as const;


    return (
        <div className="flex flex-col h-[100dvh] bg-background overflow-hidden lg:overflow-visible lg:h-auto">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-6xl mx-auto pt-6 pb-0 sm:pb-4 px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-400 mt-0.5 text-[10px] md:text-sm uppercase tracking-widest font-medium opacity-70">
                                Portfolio Configuration
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <a
                                href="/"
                                target="_blank"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all whitespace-nowrap text-sm"
                            >
                                <Eye size={16} />
                                Preview
                            </a>

                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || isSaving}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${saveSuccess
                                    ? 'bg-green-600 text-white'
                                    : hasChanges
                                        ? 'bg-primary hover:brightness-110 text-white shadow-lg shadow-primary/40'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/30'
                                    }`}
                            >
                                {isSaving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : saveSuccess ? (
                                    <Check size={16} />
                                ) : (
                                    <Save size={16} />
                                )}
                                {saveSuccess ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs - Mobile Scroller */}
                    <div className="lg:hidden -mx-4 sm:-mx-6 overflow-hidden">
                        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${activeTab === tab.id
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-gray-400 border-gray-700/50 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon size={14} className="shrink-0" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar lg:overflow-visible">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                        {/* Desktop Sidebar Tabs */}
                        <div className="hidden lg:block lg:col-span-1">
                            <nav className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-3 flex flex-col gap-1 sticky top-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full text-left ${activeTab === tab.id
                                            ? 'bg-primary text-white border border-primary/50 shadow-md shadow-primary/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <tab.icon size={18} className="shrink-0" />
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
                                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8"
                            >
                                {isLoading ? (
                                    <TabSkeleton />
                                ) : (
                                    <>
                                        {activeTab === 'general' && (
                                            <GeneralTab config={config} updateConfig={updateConfig} />
                                        )}
                                        {activeTab === 'colors' && (
                                            <ColorsTab
                                                colors={config.colors}
                                                updateColors={(colors) => updateNestedConfig('colors', colors)}
                                                theme={config.theme}
                                                updateTheme={(theme) => updateNestedConfig('theme', theme)}
                                            />
                                        )}
                                        {activeTab === 'layout' && (
                                            <LayoutTab
                                                layout={config.layout}
                                                updateLayout={(layout) => updateNestedConfig('layout', layout)}
                                            />
                                        )}
                                        {activeTab === 'content' && (
                                            <ContentTab
                                                config={config}
                                                updateHero={(hero) => updateNestedConfig('hero', hero)}
                                                updateAbout={(about) => updateNestedConfig('about', about)}
                                                updateProjects={(projects) => updateNestedConfig('projects', projects)}
                                                updateFriends={(friends) => updateNestedConfig('friends', friends)}
                                                updateExperience={(experience) => updateNestedConfig('experience', experience)}
                                                updateAcademic={(academic) => updateNestedConfig('academic', academic)}
                                                updateAchievements={(achievements) => updateNestedConfig('achievements', achievements)}
                                                updateServices={(services) => updateNestedConfig('services', services)}
                                                updateContact={(contact) => updateNestedConfig('contact', contact)}
                                            />
                                        )}
                                        {activeTab === 'projects' && (
                                            <ProjectsTab />
                                        )}
                                        {activeTab === 'users' && (
                                            <UsersTab />
                                        )}
                                        {activeTab === 'experience' && (
                                            <ExperienceTab />
                                        )}
                                        {activeTab === 'academic' && (
                                            <AcademicTab />
                                        )}
                                        {activeTab === 'achievements' && (
                                            <AchievementsTab />
                                        )}
                                        {activeTab === 'services' && (
                                            <ServicesTab />
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
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== TAB COMPONENTS ====================
function TabSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-gray-700/50 flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2 ml-4">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}


function GeneralTab({
    config,
    updateConfig,
}: {
    config: SiteConfig;
    updateConfig: (updates: Partial<SiteConfig>) => void;
}) {
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingLoader, setIsUploadingLoader] = useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const url = await uploadImage(file, 'logos');
            updateConfig({ logoUrl: url });
        } catch (error: unknown) {
            console.error('Failed to upload logo:', error);
            alert(`Failed to upload logo: ${(error as Error).message}`);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleLoaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLoader(true);
        try {
            const url = await uploadImage(file, 'loaders');
            updateConfig({ loaderUrl: url });
        } catch (error: unknown) {
            console.error('Failed to upload loader:', error);
            alert(`Failed to upload loader: ${(error as Error).message}`);
        } finally {
            setIsUploadingLoader(false);
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFavicon(true);
        try {
            const url = await uploadImage(file, 'favicons');
            updateConfig({ faviconUrl: url });
        } catch (error: unknown) {
            console.error('Failed to upload favicon:', error);
            alert(`Failed to upload favicon: ${(error as Error).message}`);
        } finally {
            setIsUploadingFavicon(false);
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                                disabled={isUploadingLogo}
                            />
                            <label
                                htmlFor="logo-upload"
                                className={`flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-lg cursor-pointer transition-colors ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploadingLogo ? (
                                    <Loader2 size={24} className="animate-spin text-gray-500" />
                                ) : (
                                    <Upload size={24} className="text-gray-300" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Loader URL (GIF/WebP/PNG)
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="url"
                                value={config.loaderUrl || ''}
                                onChange={(e) => updateConfig({ loaderUrl: e.target.value })}
                                placeholder="https://example.com/loader.gif"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLoaderUpload}
                                className="hidden"
                                id="loader-upload"
                                disabled={isUploadingLoader}
                            />
                            <label
                                htmlFor="loader-upload"
                                className={`flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-lg cursor-pointer transition-colors ${isUploadingLoader ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploadingLoader ? (
                                    <Loader2 size={24} className="animate-spin text-gray-500" />
                                ) : (
                                    <Upload size={24} className="text-gray-300" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Favicon URL (ICO/PNG)
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="url"
                                value={config.faviconUrl || ''}
                                onChange={(e) => updateConfig({ faviconUrl: e.target.value })}
                                placeholder="https://example.com/favicon.png"
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/x-icon,image/png,image/gif"
                                onChange={handleFaviconUpload}
                                className="hidden"
                                id="favicon-upload"
                                disabled={isUploadingFavicon}
                            />
                            <label
                                htmlFor="favicon-upload"
                                className={`flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-gray-700 rounded-lg cursor-pointer transition-colors ${isUploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploadingFavicon ? (
                                    <Loader2 size={24} className="animate-spin text-gray-500" />
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
    theme,
    updateTheme,
}: {
    colors: SiteConfig['colors'];
    updateColors: (colors: Partial<SiteConfig['colors']>) => void;
    theme: SiteConfig['theme'];
    updateTheme: (theme: Partial<SiteConfig['theme']>) => void;
}) {
    const colorFields = [
        { key: 'primary', label: 'Primary Color', description: 'Main accent color' },
        { key: 'secondary', label: 'Secondary Color', description: 'Secondary accent' },
        { key: 'accent', label: 'Accent / Highlight', description: 'Retro neons (Neo-Brutalism)' },
        { key: 'background', label: 'Background', description: 'Page background' },
        { key: 'surface', label: 'Surface', description: 'Card backgrounds' },
        { key: 'text', label: 'Text Color', description: 'Primary text' },
        { key: 'textMuted', label: 'Muted Text', description: 'Secondary text' },
    ] as const;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Neo-Brutalist Theme</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Border Width
                        </label>
                        <input
                            type="text"
                            value={theme?.borderWidth || '2px'}
                            onChange={(e) => updateTheme({ borderWidth: e.target.value })}
                            placeholder="e.g., 2px"
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Border Radius
                        </label>
                        <input
                            type="text"
                            value={theme?.borderRadius || '0px'}
                            onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                            placeholder="e.g., 0px"
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Box Shadow
                        </label>
                        <input
                            type="text"
                            value={theme?.boxShadow || '4px 4px 0px #000'}
                            onChange={(e) => updateTheme({ boxShadow: e.target.value })}
                            placeholder="e.g., 4px 4px 0px #000"
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-800" />

            <h2 className="text-xl font-bold text-white mb-4">Color Palette</h2>

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
                                className="flex-1 px-3 py-2 bg-black/30 border border-gray-700 rounded text-white font-mono text-sm focus:outline-none focus:border-primary"
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
                    <Button
                        variant="default"
                        style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                    >
                        Primary Button
                    </Button>
                    <Button
                        variant="neon"
                    >
                        Secondary Button
                    </Button>
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
    updateExperience,
    updateAcademic,
    updateAchievements,
    updateServices,
    updateContact,
}: {
    config: SiteConfig;
    updateHero: (hero: Partial<SiteConfig['hero']>) => void;
    updateAbout: (about: Partial<SiteConfig['about']>) => void;
    updateProjects: (projects: Partial<SiteConfig['projects']>) => void;
    updateFriends: (friends: Partial<SiteConfig['friends']>) => void;
    updateExperience: (experience: Partial<SiteConfig['experience']>) => void;
    updateAcademic: (academic: Partial<SiteConfig['academic']>) => void;
    updateAchievements: (achievements: Partial<SiteConfig['achievements']>) => void;
    updateServices: (services: Partial<SiteConfig['services']>) => void;
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
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
                                className="flex-1 px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                            />
                            <button
                                onClick={addSkill}
                                className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Experience Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Experience Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.experience?.title || 'Work Experience'}
                            onChange={(e) => updateExperience({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.experience?.subtitle || ''}
                            onChange={(e) => updateExperience({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Academic Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Academic Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.academic?.title || 'Education'}
                            onChange={(e) => updateAcademic({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.academic?.subtitle || ''}
                            onChange={(e) => updateAcademic({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Achievements Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Achievements Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.achievements?.title || 'Certifications & Honors'}
                            onChange={(e) => updateAchievements({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.achievements?.subtitle || ''}
                            onChange={(e) => updateAchievements({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Services Section Header */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Services Section</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={config.services?.title || 'Services & Expertise'}
                            onChange={(e) => updateServices({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Section Subtitle
                        </label>
                        <textarea
                            value={config.services?.subtitle || ''}
                            onChange={(e) => updateServices({ subtitle: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        />
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
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
                            className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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

    const loadProjects = async () => {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
        setLoading(false);
    };

    useEffect(() => {
        loadProjects();
    }, []);

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Projects</h2>
                {loading ? (
                    <Skeleton className="h-10 w-32 rounded-lg" />
                ) : (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Project
                    </Button>
                )}
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

            {loading ? (
                <SkeletonList />
            ) : (
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
                                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">Featured</span>
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
            )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
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
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">GitHub URL</label>
                    <input
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-sm">
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
                        className="flex-1 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                    <button onClick={addTag} className="px-3 py-2 bg-primary text-white rounded-lg">Add</button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-white/5 text-primary focus:ring-primary"
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
                    className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
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

    const loadFriends = async () => {
        const fetchedFriends = await getFriends();
        setFriends(fetchedFriends);
        setLoading(false);
    };

    useEffect(() => {
        loadFriends();
    }, []);

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Manage Friends</h2>
                    <p className="text-sm text-gray-400">Add cool people you know to your portfolio</p>
                </div>
                {loading ? (
                    <Skeleton className="h-10 w-32 rounded-lg" />
                ) : (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Friend
                    </Button>
                )}
            </div>

            {loading ? <SkeletonList /> : (
                <>
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
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
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
                </>
            )}
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
        } catch (error: unknown) {
            console.error('Failed to upload avatar:', error);
            alert(`Failed to upload avatar: ${(error as Error).message}`);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Friend's name"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                    className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Avatar URL</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            placeholder="https://..."
                            className="flex-1 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
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
                                    <Loader2 size={20} className="animate-spin text-gray-500" />
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
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-2">Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="url"
                        value={formData.socialLinks.github || ''}
                        onChange={(e) => updateSocialLink('github', e.target.value)}
                        placeholder="GitHub URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.linkedin || ''}
                        onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                        placeholder="LinkedIn URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.twitter || ''}
                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                        placeholder="Twitter URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.instagram || ''}
                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                        placeholder="Instagram URL"
                        className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                        type="url"
                        value={formData.socialLinks.website || ''}
                        onChange={(e) => updateSocialLink('website', e.target.value)}
                        placeholder="Website URL"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">
                    Cancel
                </button>
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                    {friend ? 'Save Changes' : 'Add Friend'}
                </button>
            </div>
        </div>
    );
}

// Known games list
const KNOWN_GAMES = [
    { id: 'flappy-dillu', name: 'Flappy Dillu' },
];

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [gameConfigs, setGameConfigs] = useState<Record<string, any>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [savingGame, setSavingGame] = useState<string | null>(null);
    const [deletingGame, setDeletingGame] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState<{ gameId: string; type: string } | null>(null);



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

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    General Settings
                </button>
                <button
                    onClick={() => setActiveSubTab('games')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSubTab === 'games'
                        ? 'bg-primary text-white'
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

                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-gray-400 text-sm">
                            <strong>Note:</strong> When guest play is enabled, guests can play games but their scores won&apos;t be saved to the database.
                        </p>
                    </div>
                </div>
            )}

            {activeSubTab === 'games' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Arcade Games</h2>

                    {loadingGames ? (
                        <SkeletonList />
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
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                                <Gamepad2 size={24} className="text-gray-400" />
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
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'skillIssueImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'skillIssueImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-gray-500" />
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
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'congratsImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'congratsImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-gray-500" />
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
                                                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(game.id, 'thumbnailImage', e)}
                                                                className="hidden"
                                                            />
                                                            {uploadingImage?.gameId === game.id && uploadingImage.type === 'thumbnailImage' ? (
                                                                <Loader2 size={20} className="animate-spin text-gray-500" />
                                                            ) : (
                                                                <Upload size={20} className="text-gray-500" />
                                                            )}
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Settings */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-black/20 rounded-lg">
                                                <label className="text-sm text-gray-300">Min Score for Congrats:</label>
                                                <input
                                                    type="number"
                                                    value={gameConfigs[game.id]?.minScoreForCongrats || 10}
                                                    onChange={(e) => handleSaveGameConfig(game.id, { minScoreForCongrats: parseInt(e.target.value) || 10 })}
                                                    className="w-full sm:w-24 px-3 py-2 bg-black/40 border border-gray-600 rounded-lg text-white"
                                                />
                                            </div>

                                            {/* Allowed Roles */}
                                            <div className="p-3 bg-black/20 rounded-lg">
                                                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Allowed Roles (RBAC)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['admin', 'player', 'user', 'guest', 'vip', 'beta_tester', 'friend'].map((role) => {
                                                        const isAllowed = gameConfigs[game.id]?.allowedRoles?.includes(role) ||
                                                            (role === 'admin') || // admin always allowed
                                                            (!gameConfigs[game.id]?.allowedRoles && (role === 'player' || role === 'admin')); // default

                                                        return (
                                                            <button
                                                                key={role}
                                                                onClick={() => {
                                                                    const currentRoles = gameConfigs[game.id]?.allowedRoles || ['player', 'admin'];
                                                                    const newRoles = isAllowed
                                                                        ? currentRoles.filter((r: string) => r !== role)
                                                                        : [...currentRoles, role];
                                                                    handleSaveGameConfig(game.id, { allowedRoles: Array.from(new Set(newRoles)) });
                                                                }}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${isAllowed
                                                                    ? 'bg-primary/20 border-primary text-primary'
                                                                    : 'bg-white/5 border-gray-700 text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                {role}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-2 italic">
                                                    * Admin always has access. Players and guests have access by default unless restricted.
                                                </p>
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
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
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-700'
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

// ==================== EXPERIENCE TAB ====================

function ExperienceTab() {
    const [experience, setExperience] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const loadExperience = async () => {
        setLoading(true);
        const data = await getExperience();
        setExperience(data);
        setLoading(false);
    };

    useEffect(() => {
        loadExperience();
    }, []);

    const handleAddExperience = async (exp: Omit<Experience, 'id'>) => {
        await addExperience(exp);
        loadExperience();
        setIsAdding(false);
    };

    const handleUpdateExperience = async (id: string, updates: Partial<Experience>) => {
        await updateExperience(id, updates);
        loadExperience();
        setEditingExp(null);
    };

    const handleDeleteExperience = async (id: string) => {
        if (confirm('Are you sure you want to delete this experience entry?')) {
            await deleteExperience(id);
            loadExperience();
        }
    };

    if (isAdding || editingExp) {
        return (
            <ExperienceForm
                experience={editingExp || undefined}
                onSubmit={(data) => {
                    if (editingExp?.id) {
                        handleUpdateExperience(editingExp.id, data);
                    } else {
                        handleAddExperience(data);
                    }
                }}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingExp(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Experience</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Experience
                </button>
            </div>

            {loading ? (
                <SkeletonList />
            ) : experience.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-700">
                    <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No experience entries found. Add your first one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {experience.map((exp) => (
                        <div
                            key={exp.id}
                            className="p-4 bg-white/5 rounded-xl border border-gray-700/50 flex items-center justify-between group"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                                <p className="text-primary text-sm font-medium">{exp.company}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : 'Present')} {formatDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                                </p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingExp(exp)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => exp.id && handleDeleteExperience(exp.id)}
                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExperienceForm({
    experience,
    onSubmit,
    onCancel,
}: {
    experience?: Experience;
    onSubmit: (experience: Omit<Experience, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Experience, 'id'>>({
        company: experience?.company || '',
        role: experience?.role || '',
        startDate: experience?.startDate || '',
        endDate: experience?.endDate || '',
        isCurrent: experience?.isCurrent || false,
        description: experience?.description || '',
        link: experience?.link || '',
        technologies: experience?.technologies || [],
        order: experience?.order || 0,
    });

    const [newTech, setNewTech] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addTech = () => {
        if (newTech.trim()) {
            setFormData({ ...formData, technologies: [...(formData.technologies || []), newTech.trim()] });
            setNewTech('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-white">
                {experience ? 'Edit Experience' : 'Add Experience'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                    <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role/Title</label>
                    <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Month/Year</label>
                    <input
                        type="month"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">End Month/Year</label>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isCurrent}
                                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                                className="rounded border-gray-700 bg-white/5 text-primary focus:ring-primary"
                            />
                            Present
                        </label>
                    </div>
                    <input
                        type="month"
                        disabled={formData.isCurrent}
                        required={!formData.isCurrent}
                        value={formData.isCurrent ? '' : (formData.endDate || '')}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Link</label>
                    <input
                        type="url"
                        value={formData.link || ''}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.technologies?.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 flex items-center gap-1">
                            {tech}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    technologies: formData.technologies?.filter((_, i) => i !== idx)
                                })}
                                className="hover:text-red-400"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={addTech}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all"
                >
                    {experience ? 'Save Changes' : 'Add Experience'}
                </button>
            </div>
        </form>
    );
}

// ==================== ACADEMIC TAB ====================

function AcademicTab() {
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEdu, setEditingEdu] = useState<Education | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const loadEducation = async () => {
        setLoading(true);
        const data = await getEducation();
        setEducation(data);
        setLoading(false);
    };

    useEffect(() => {
        loadEducation();
    }, []);

    const handleAddEducation = async (edu: Omit<Education, 'id'>) => {
        await addEducation(edu);
        loadEducation();
        setIsAdding(false);
    };

    const handleUpdateEducation = async (id: string, updates: Partial<Education>) => {
        await updateEducation(id, updates);
        loadEducation();
        setEditingEdu(null);
    };

    const handleDeleteEducation = async (id: string) => {
        if (confirm('Are you sure you want to delete this education entry?')) {
            await deleteEducation(id);
            loadEducation();
        }
    };

    if (isAdding || editingEdu) {
        return (
            <AcademicForm
                education={editingEdu || undefined}
                onSubmit={(data) => {
                    if (editingEdu?.id) {
                        handleUpdateEducation(editingEdu.id, data);
                    } else {
                        handleAddEducation(data);
                    }
                }}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingEdu(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Education</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Education
                </button>
            </div>

            {loading ? (
                <SkeletonList />
            ) : education.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-700">
                    <GraduationCap size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No education entries found. Add your first one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {education.map((edu) => (
                        <div
                            key={edu.id}
                            className="p-4 bg-white/5 rounded-xl border border-gray-700/50 flex items-center justify-between group"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">
                                    {edu.degree} {edu.score && <span className="text-primary/70 text-sm ml-2">— {edu.score}</span>}
                                </h3>
                                <p className="text-primary text-sm font-medium">{edu.institution}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {formatDate(edu.startDate)} — {edu.isCurrent ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'Present')} {formatDuration(edu.startDate, edu.endDate, edu.isCurrent)}
                                </p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingEdu(edu)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => edu.id && handleDeleteEducation(edu.id)}
                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AcademicForm({
    education,
    onSubmit,
    onCancel,
}: {
    education?: Education;
    onSubmit: (education: Omit<Education, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Education, 'id'>>({
        institution: education?.institution || '',
        degree: education?.degree || '',
        startDate: education?.startDate || '',
        endDate: education?.endDate || '',
        isCurrent: education?.isCurrent || false,
        score: education?.score || '',
        description: education?.description || '',
        link: education?.link || '',
        order: education?.order || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-white">
                {education ? 'Edit Education' : 'Add Education'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Institution</label>
                    <input
                        type="text"
                        required
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Degree/Qualification</label>
                    <input
                        type="text"
                        required
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Month/Year</label>
                    <input
                        type="month"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">End Month/Year</label>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isCurrent}
                                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                                className="rounded border-gray-700 bg-white/5 text-primary focus:ring-primary"
                            />
                            Present
                        </label>
                    </div>
                    <input
                        type="month"
                        disabled={formData.isCurrent}
                        required={!formData.isCurrent}
                        value={formData.isCurrent ? '' : (formData.endDate || '')}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Institution Link</label>
                    <input
                        type="url"
                        value={formData.link || ''}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Score/Percentage (Optional)</label>
                    <input
                        type="text"
                        value={formData.score || ''}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                        placeholder="e.g. 95% or CGPA: 9.8"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all"
                >
                    {education ? 'Save Changes' : 'Add Education'}
                </button>
            </div>
        </form>
    );
}

// ==================== ACHIEVEMENTS TAB ====================

function AchievementsTab() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAch, setEditingAch] = useState<Achievement | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const loadAchievements = async () => {
        setLoading(true);
        const data = await getAchievements();
        setAchievements(data);
        setLoading(false);
    };

    useEffect(() => {
        loadAchievements();
    }, []);

    const handleAddAchievement = async (ach: Omit<Achievement, 'id'>) => {
        await addAchievement(ach);
        loadAchievements();
        setIsAdding(false);
    };

    const handleUpdateAchievement = async (id: string, updates: Partial<Achievement>) => {
        await updateAchievement(id, updates);
        loadAchievements();
        setEditingAch(null);
    };

    const handleDeleteAchievement = async (id: string) => {
        if (confirm('Are you sure you want to delete this achievement?')) {
            await deleteAchievement(id);
            loadAchievements();
        }
    };

    if (isAdding || editingAch) {
        return (
            <AchievementForm
                achievement={editingAch || undefined}
                onSubmit={(data) => {
                    if (editingAch?.id) {
                        handleUpdateAchievement(editingAch.id, data);
                    } else {
                        handleAddAchievement(data);
                    }
                }}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingAch(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Achievements</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Achievement
                </button>
            </div>

            {loading ? (
                <SkeletonList />
            ) : achievements.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-700">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No achievements found. Add your first one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {achievements.map((ach) => (
                        <div
                            key={ach.id}
                            className="p-4 bg-white/5 rounded-xl border border-gray-700/50 flex items-center justify-between group"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{ach.title}</h3>
                                <p className="text-primary text-sm font-medium">{ach.issuer}</p>
                                <p className="text-gray-400 text-sm mt-1">{ach.date}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingAch(ach)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => ach.id && handleDeleteAchievement(ach.id)}
                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AchievementForm({
    achievement,
    onSubmit,
    onCancel,
}: {
    achievement?: Achievement;
    onSubmit: (achievement: Omit<Achievement, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Achievement, 'id'>>({
        title: achievement?.title || '',
        issuer: achievement?.issuer || '',
        date: achievement?.date || '',
        description: achievement?.description || '',
        link: achievement?.link || '',
        imageUrl: achievement?.imageUrl || '',
        order: achievement?.order || 0,
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'achievements');
            setFormData({ ...formData, imageUrl: url });
        } catch (error: any) {
            alert(`Failed to upload: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-white">
                {achievement ? 'Edit Achievement' : 'Add Achievement'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Achievement Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Issuer</label>
                    <input
                        type="text"
                        required
                        value={formData.issuer}
                        onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                        type="text"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link</label>
                    <input
                        type="url"
                        value={formData.link || ''}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Achievement Image</label>
                <div className="flex gap-4">
                    {formData.imageUrl && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                            <img src={formData.imageUrl} alt="Achievement" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                    <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                        {isUploading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : <Upload size={24} className="text-gray-500 mb-2" />}
                        <span className="text-sm text-gray-400">Click to upload badge or certificate image</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all"
                >
                    {achievement ? 'Save Changes' : 'Add Achievement'}
                </button>
            </div>
        </form>
    );
}

// ==================== SERVICES TAB ====================

function ServicesTab() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingServ, setEditingServ] = useState<Service | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const loadServices = async () => {
        setLoading(true);
        const data = await getServices();
        setServices(data);
        setLoading(false);
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleAddService = async (serv: Omit<Service, 'id'>) => {
        await addService(serv);
        loadServices();
        setIsAdding(false);
    };

    const handleUpdateService = async (id: string, updates: Partial<Service>) => {
        await updateService(id, updates);
        loadServices();
        setEditingServ(null);
    };

    const handleDeleteService = async (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            await deleteService(id);
            loadServices();
        }
    };

    if (isAdding || editingServ) {
        return (
            <ServiceForm
                service={editingServ || undefined}
                onSubmit={(data) => {
                    if (editingServ?.id) {
                        handleUpdateService(editingServ.id, data);
                    } else {
                        handleAddService(data);
                    }
                }}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingServ(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Manage Services</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Service
                </button>
            </div>

            {loading ? (
                <SkeletonList />
            ) : services.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-gray-700">
                    <Layout size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No services found. Add your first one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {services.map((serv) => (
                        <div
                            key={serv.id}
                            className="p-4 bg-white/5 rounded-xl border border-gray-700/50 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{serv.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-1">{serv.description}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingServ(serv)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => serv.id && handleDeleteService(serv.id)}
                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ServiceForm({
    service,
    onSubmit,
    onCancel,
}: {
    service?: Service;
    onSubmit: (service: Omit<Service, 'id'>) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Omit<Service, 'id'>>({
        title: service?.title || '',
        description: service?.description || '',
        icon: service?.icon || 'Code',
        order: service?.order || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-white">
                {service ? 'Edit Service' : 'Add Service'}
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Service Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icon Name (Lucide)</label>
                    <input
                        type="text"
                        required
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="Code, Layout, Server, Database, Smartphone..."
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Visit lucide.dev for icon names.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                    <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-gray-300 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all"
                >
                    {service ? 'Save Changes' : 'Add Service'}
                </button>
            </div>
        </form>
    );
}

// ==================== LAYOUT TAB ====================

function LayoutTab({
    layout,
    updateLayout,
}: {
    layout: SiteConfig['layout'];
    updateLayout: (layout: Partial<SiteConfig['layout']>) => void;
}) {
    const sections = layout?.sectionOrder || ['hero', 'about', 'experience', 'services', 'academic', 'achievements', 'projects', 'friends', 'contact'];
    const hiddenSections = layout?.hiddenSections || [];

    const handleReorder = (newOrder: string[]) => {
        updateLayout({ sectionOrder: newOrder });
    };

    const toggleVisibility = (sectionId: string) => {
        const newHidden = hiddenSections.includes(sectionId)
            ? hiddenSections.filter(id => id !== sectionId)
            : [...hiddenSections, sectionId];
        updateLayout({ hiddenSections: newHidden });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            updateLayout({ sectionOrder: newSections });
        }
    };

    const sectionLabels: Record<string, string> = {
        hero: 'Hero Section',
        about: 'About Me',
        experience: 'Work Experience',
        services: 'Services & Expertise',
        academic: 'Academic Background',
        achievements: 'Achievements & Certifications',
        projects: 'Projects Showcase',
        friends: 'Friends Section',
        contact: 'Contact Section',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Page Layout</h2>
                    <p className="text-gray-400 text-sm mt-1">Click and drag handles or use arrows to reorder sections.</p>
                </div>
            </div>

            <Reorder.Group
                axis="y"
                values={sections}
                onReorder={handleReorder}
                className="bg-white/5 rounded-xl border border-gray-700/50 overflow-hidden divide-y divide-gray-700/50"
            >
                {sections.map((sectionId, index) => (
                    <ReorderItem
                        key={sectionId}
                        sectionId={sectionId}
                        label={sectionLabels[sectionId] || sectionId}
                        index={index}
                        total={sections.length}
                        isHidden={hiddenSections.includes(sectionId)}
                        onMove={moveSection}
                        onToggleVisibility={toggleVisibility}
                    />
                ))}
            </Reorder.Group>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm text-primary flex items-center gap-2">
                    <Check size={16} />
                    Drag the icons on the left to reorder sections instantly.
                </p>
            </div>
        </div>
    );
}

function ReorderItem({
    sectionId,
    label,
    index,
    total,
    isHidden,
    onMove,
    onToggleVisibility
}: {
    sectionId: string;
    label: string;
    index: number;
    total: number;
    isHidden: boolean;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onToggleVisibility: (sectionId: string) => void;
}) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={sectionId}
            dragListener={false}
            dragControls={controls}
            className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors group select-none bg-gray-900/40 ${isHidden ? 'opacity-50 grayscale' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div
                    className="text-gray-600 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={20} />
                </div>
                <div>
                    <h3 className={`font-medium capitalize ${isHidden ? 'text-gray-500' : 'text-white'}`}>
                        {label}
                        {isHidden && <span className="ml-2 text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">HIDDEN</span>}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {sectionId}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onToggleVisibility(sectionId)}
                    className={`p-2 rounded-lg transition-all ${isHidden ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    title={isHidden ? "Show Section" : "Hide Section"}
                >
                    {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-all md:flex hidden"
                    title="Move Up"
                >
                    <MoveUp size={18} />
                </button>
                <button
                    onClick={() => onMove(index, 'down')}
                    disabled={index === total - 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-all md:flex hidden"
                    title="Move Down"
                >
                    <MoveDown size={18} />
                </button>
            </div>
        </Reorder.Item>
    );
}

function UsersTab() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingUid, setUpdatingUid] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setUpdatingUid(uid);
        try {
            await updateUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('Failed to update user role');
        } finally {
            setUpdatingUid(null);
        }
    };

    const roles: UserRole[] = ['user', 'player', 'admin', 'vip', 'beta_tester', 'friend', 'guest'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">User Management</h2>
                    <p className="text-gray-400 text-sm">Manage user roles and permissions (RBAC)</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
            ) : (
                <div className="grid gap-4">
                    {users.map((u) => (
                        <div key={u.uid} className="bg-black/20 border border-gray-700/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        (u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{u.displayName || u.email || 'Anonymous User'}</h3>
                                    <p className="text-xs text-gray-500">{u.uid}</p>
                                    <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        disabled={updatingUid === u.uid}
                                        onClick={() => handleRoleChange(u.uid, role)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${u.role === role
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-white/5 border-gray-700 text-gray-400 hover:text-white hover:bg-white/10'
                                            } ${updatingUid === u.uid ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {role === u.role && updatingUid === u.uid ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            role
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="text-center py-12 bg-black/20 rounded-xl border border-gray-700/50">
                            <Users className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-400">No users found in the database.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
