import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from './config';

// ==================== SITE CONFIGURATION ====================

export interface Project {
    id?: string;
    title: string;
    description: string;
    tags: string[];
    demoUrl?: string;
    githubUrl?: string;
    imageUrl?: string;
    order: number;
    featured: boolean;
}

export interface SiteConfig {
    // Branding
    siteName: string;
    siteDescription: string;
    logoUrl?: string;

    // Colors (CSS custom properties)
    colors: {
        primary: string;       // Primary accent color
        secondary: string;     // Secondary accent color
        background: string;    // Main background color
        surface: string;       // Card/surface background
        text: string;          // Primary text color
        textMuted: string;     // Muted/secondary text
    };

    // Hero Section
    hero: {
        tagline: string;       // Small text above title (e.g., "System Architect & Full Stack Engineer")
        title: string;
        titleHighlight?: string; // Optional highlighted part of title
        subtitle: string;
        ctaText: string;
        ctaLink: string;
        secondaryCtaText?: string;
        secondaryCtaLink?: string;
    };

    // About Section
    about: {
        title: string;
        description: string;
        skills: string[];
        skillsLabel: string;   // e.g., "Core Competencies"
        imageUrl?: string;
    };

    // Projects Section
    projects: {
        title: string;
        subtitle: string;
    };

    // Friends Section
    friends: {
        title: string;
        subtitle: string;
    };

    // Contact Section
    contact: {
        title: string;
    };

    // Social Links
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        email?: string;
    };

    // Game Settings
    gameSettings: {
        allowGuestPlay: boolean;         // Allow playing without login
        saveGuestScoresLocally: boolean; // Save guest scores to localStorage
        showLeaderboard: boolean;        // Show global leaderboard
        requireLoginForLeaderboard: boolean; // Require login to appear on leaderboard
    };

    // Metadata
    updatedAt?: Date;
    updatedBy?: string;
}

// Default configuration
export const defaultConfig: SiteConfig = {
    siteName: 'Developer Portfolio',
    siteDescription: 'A developer portfolio showcasing systems engineering and interactive web experiences.',

    colors: {
        primary: '#8b5cf6',      // Violet
        secondary: '#d946ef',    // Fuchsia
        background: '#050505',   // Near black
        surface: '#111111',      // Dark gray
        text: '#e5e5e5',         // Light gray
        textMuted: '#737373',    // Muted gray
    },

    hero: {
        tagline: 'System Architect & Full Stack Engineer',
        title: 'Building Systems',
        titleHighlight: 'That Scale',
        subtitle: 'I bridge the gap between complex backend architecture and immersive frontend experiences. Explore my technical breakdown or jump into the arcade.',
        ctaText: 'View Projects',
        ctaLink: '/#projects',
        secondaryCtaText: 'Enter Arcade',
        secondaryCtaLink: '/arcade',
    },

    about: {
        title: 'Engineering Philosophy',
        description: 'I focus on building resilient, high-performance applications. My approach prioritizes type safety, scalability, and maintainability over short-term hacks. I believe the best user experiences are powered by rock-solid architecture.',
        skills: ['System Design', 'Microservices', 'React/Next.js', 'Node.js', 'TypeScript', 'WebGL/Canvas', 'Database Optimization', 'CI/CD Pipelines'],
        skillsLabel: 'Core Competencies',
    },

    projects: {
        title: 'Featured Projects',
        subtitle: 'A selection of complex systems where I faced interesting architectural challenges.',
    },

    friends: {
        title: 'Cool People I Know',
        subtitle: 'Amazing developers, designers, and creators I\'m lucky to call friends.',
    },

    contact: {
        title: 'Ready to collaborate?',
    },

    socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        email: 'hello@example.com',
    },

    gameSettings: {
        allowGuestPlay: true,
        saveGuestScoresLocally: true,
        showLeaderboard: true,
        requireLoginForLeaderboard: true,
    },
};

const CONFIG_DOC_ID = 'siteConfig';

/**
 * Get site configuration from Firestore
 */
export async function getSiteConfig(): Promise<SiteConfig> {
    try {
        const configRef = doc(db, 'config', CONFIG_DOC_ID);
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
            return { ...defaultConfig, ...configSnap.data() } as SiteConfig;
        }

        return defaultConfig;
    } catch (error) {
        console.error('Error fetching site config:', error);
        return defaultConfig;
    }
}

/**
 * Update site configuration (admin only)
 */
export async function updateSiteConfig(
    config: Partial<SiteConfig>,
    adminUid: string
): Promise<void> {
    const configRef = doc(db, 'config', CONFIG_DOC_ID);

    await setDoc(configRef, {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
    }, { merge: true });
}

/**
 * Subscribe to site configuration changes (real-time updates)
 */
export function subscribeSiteConfig(
    callback: (config: SiteConfig) => void
): () => void {
    const configRef = doc(db, 'config', CONFIG_DOC_ID);

    return onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
            callback({ ...defaultConfig, ...snap.data() } as SiteConfig);
        } else {
            callback(defaultConfig);
        }
    }, (error) => {
        console.error('Error subscribing to config:', error);
        callback(defaultConfig);
    });
}

/**
 * Initialize default config if not exists
 */
export async function initializeSiteConfig(adminUid: string): Promise<void> {
    const configRef = doc(db, 'config', CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
        await setDoc(configRef, {
            ...defaultConfig,
            updatedAt: serverTimestamp(),
            updatedBy: adminUid,
        });
    }
}

// ==================== PROJECTS CRUD ====================

const PROJECTS_COLLECTION = 'projects';

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
    try {
        const projectsRef = collection(db, PROJECTS_COLLECTION);
        const q = query(projectsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Project));
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

/**
 * Subscribe to projects (real-time)
 */
export function subscribeProjects(
    callback: (projects: Project[]) => void
): () => void {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(projectsRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Project));
        callback(projects);
    }, (error) => {
        console.error('Error subscribing to projects:', error);
        callback([]);
    });
}

/**
 * Add a new project
 */
export async function addProject(project: Omit<Project, 'id'>): Promise<string> {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const docRef = await addDoc(projectsRef, project);
    return docRef.id;
}

/**
 * Update a project
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(projectRef, updates);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(projectRef);
}

// ==================== FRIENDS CRUD ====================

export interface Friend {
    id?: string;
    name: string;
    description: string;
    avatarUrl?: string;
    portfolioUrl?: string;
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        website?: string;
    };
    order: number;
}

const FRIENDS_COLLECTION = 'friends';

/**
 * Get all friends
 */
export async function getFriends(): Promise<Friend[]> {
    try {
        const friendsRef = collection(db, FRIENDS_COLLECTION);
        const q = query(friendsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Friend));
    } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
}

/**
 * Subscribe to friends (real-time)
 */
export function subscribeFriends(
    callback: (friends: Friend[]) => void
): () => void {
    const friendsRef = collection(db, FRIENDS_COLLECTION);
    const q = query(friendsRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const friends = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Friend));
        callback(friends);
    }, (error) => {
        console.error('Error subscribing to friends:', error);
        callback([]);
    });
}

/**
 * Add a new friend
 */
export async function addFriend(friend: Omit<Friend, 'id'>): Promise<string> {
    const friendsRef = collection(db, FRIENDS_COLLECTION);
    const docRef = await addDoc(friendsRef, friend);
    return docRef.id;
}

/**
 * Update a friend
 */
export async function updateFriend(id: string, updates: Partial<Friend>): Promise<void> {
    const friendRef = doc(db, FRIENDS_COLLECTION, id);
    await updateDoc(friendRef, updates);
}

/**
 * Delete a friend
 */
export async function deleteFriend(id: string): Promise<void> {
    const friendRef = doc(db, FRIENDS_COLLECTION, id);
    await deleteDoc(friendRef);
}

