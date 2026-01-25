'use client';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Gamepad2, Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const { user, profile, loading, updateDisplayName } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-slate-400">Please sign in to view your profile.</p>
            </div>
        );
    }

    const handleStartEdit = () => {
        setNewDisplayName(user.displayName || "");
        setIsEditingName(true);
        setSaveError(null);
        setSaveSuccess(false);
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setNewDisplayName("");
        setSaveError(null);
    };

    const handleSaveDisplayName = async () => {
        if (!newDisplayName.trim()) {
            setSaveError("Display name cannot be empty");
            return;
        }

        if (newDisplayName.length > 20) {
            setSaveError("Display name must be 20 characters or less");
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            await updateDisplayName(newDisplayName.trim());
            setIsEditingName(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to update name");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                {/* Profile Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-violet-500/20 overflow-hidden shadow-xl">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold">{user.displayName || 'Anonymous Player'}</h2>
                            <p className="text-slate-400 mt-1">{user.email}</p>

                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">
                                <Shield size={14} className="text-violet-400" />
                                <span className="capitalize text-slate-300">{profile?.role || 'User'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 mt-8 border-t border-white/5 pt-8">
                        {/* Display Name / In-Game Name (Editable) */}
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <Gamepad2 size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">In-Game Name</p>

                                    {isEditingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newDisplayName}
                                                onChange={(e) => setNewDisplayName(e.target.value)}
                                                maxLength={20}
                                                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500 text-sm"
                                                placeholder="Enter display name"
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDisplayName}
                                                disabled={saving}
                                                className="bg-green-600 hover:bg-green-500 h-9 px-3"
                                            >
                                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                                className="h-9 px-3"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-slate-200 font-medium">{user.displayName || 'Not set'}</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleStartEdit}
                                                className="h-8 px-2 text-slate-400 hover:text-white"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                        </div>
                                    )}

                                    {saveError && (
                                        <p className="text-red-400 text-xs mt-2">{saveError}</p>
                                    )}
                                    {saveSuccess && (
                                        <p className="text-green-400 text-xs mt-2">Display name updated successfully!</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mt-3 ml-12">This name will appear on game leaderboards</p>
                        </div>

                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-slate-200">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
