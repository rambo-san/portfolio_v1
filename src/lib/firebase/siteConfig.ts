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

export interface Education {
    id?: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    score?: string; // e.g., "CGPA: 9.5" or "92%"
    description?: string;
    link?: string;
    order: number;
}

export interface Experience {
    id?: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description: string;
    link?: string;
    technologies?: string[];
    order: number;
}

export interface Achievement {
    id?: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    link?: string;
    imageUrl?: string;
    order: number;
}

export interface Service {
    id?: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    order: number;
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
        accent: string;        // Vibrant accent color (Neo-Brutalism)
    };

    // Theme Customization (Neo-Brutalism / Retro)
    theme: {
        borderWidth: string;   // e.g., "2px", "4px"
        borderRadius: string;  // e.g., "0px", "8px"
        boxShadow: string;     // e.g., "4px 4px 0px #000"
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

    // Experience Section
    experience: {
        title: string;
        subtitle: string;
    };

    // Academic Section
    academic: {
        title: string;
        subtitle: string;
    };

    // Achievements Section
    achievements: {
        title: string;
        subtitle: string;
    };

    // Services Section
    services: {
        title: string;
        subtitle: string;
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

    // Layout Settings
    layout: {
        sectionOrder: string[];
        hiddenSections: string[];
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
        primary: '#dc2626',      // Red-600 (Your original theme)
        secondary: '#7f1d1d',    // Red-900 
        background: '#050505',   // Near black
        surface: '#111111',      // Dark gray
        text: '#e5e5e5',         // Light gray
        textMuted: '#737373',    // Muted gray
        accent: '#BC13FE',       // Cyber Purple
    },

    theme: {
        borderWidth: '2px',
        borderRadius: '0px',     // Sharp corners for brutalist look
        boxShadow: '4px 4px 0px #000000', // Hard shadow
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

    experience: {
        title: 'Work Experience',
        subtitle: 'My professional journey in the tech industry.',
    },

    academic: {
        title: 'Education',
        subtitle: 'My academic background and qualifications.',
    },

    achievements: {
        title: 'Certifications & Honors',
        subtitle: 'Recognition of my technical expertise and contributions.',
    },

    services: {
        title: 'Services & Expertise',
        subtitle: 'High-impact solutions tailored to your business needs.',
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

    layout: {
        sectionOrder: ['hero', 'about', 'experience', 'services', 'academic', 'achievements', 'projects', 'friends', 'contact'],
        hiddenSections: ['services'], // Services hidden by default as requested earlier
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

// ==================== EXPERIENCE CRUD ====================

const EXPERIENCE_COLLECTION = 'experience';

/**
 * Get all experience entries
 */
export async function getExperience(): Promise<Experience[]> {
    try {
        const expRef = collection(db, EXPERIENCE_COLLECTION);
        const q = query(expRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Experience));
    } catch (error) {
        console.error('Error fetching experience:', error);
        return [];
    }
}

/**
 * Subscribe to experience (real-time)
 */
export function subscribeExperience(
    callback: (experience: Experience[]) => void
): () => void {
    const expRef = collection(db, EXPERIENCE_COLLECTION);
    const q = query(expRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const experience = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Experience));
        callback(experience);
    }, (error) => {
        console.error('Error subscribing to experience:', error);
        callback([]);
    });
}

/**
 * Add a new experience entry
 */
export async function addExperience(experience: Omit<Experience, 'id'>): Promise<string> {
    const expRef = collection(db, EXPERIENCE_COLLECTION);
    const docRef = await addDoc(expRef, experience);
    return docRef.id;
}

/**
 * Update an experience entry
 */
export async function updateExperience(id: string, updates: Partial<Experience>): Promise<void> {
    const expRef = doc(db, EXPERIENCE_COLLECTION, id);
    await updateDoc(expRef, updates);
}

/**
 * Delete an experience entry
 */
export async function deleteExperience(id: string): Promise<void> {
    const expRef = doc(db, EXPERIENCE_COLLECTION, id);
    await deleteDoc(expRef);
}

// ==================== EDUCATION CRUD ====================

const EDUCATION_COLLECTION = 'education';

/**
 * Get all education entries
 */
export async function getEducation(): Promise<Education[]> {
    try {
        const eduRef = collection(db, EDUCATION_COLLECTION);
        const q = query(eduRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Education));
    } catch (error) {
        console.error('Error fetching education:', error);
        return [];
    }
}

/**
 * Subscribe to education (real-time)
 */
export function subscribeEducation(
    callback: (education: Education[]) => void
): () => void {
    const eduRef = collection(db, EDUCATION_COLLECTION);
    const q = query(eduRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const education = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Education));
        callback(education);
    }, (error) => {
        console.error('Error subscribing to education:', error);
        callback([]);
    });
}

/**
 * Add a new education entry
 */
export async function addEducation(education: Omit<Education, 'id'>): Promise<string> {
    const eduRef = collection(db, EDUCATION_COLLECTION);
    const docRef = await addDoc(eduRef, education);
    return docRef.id;
}

/**
 * Update an education entry
 */
export async function updateEducation(id: string, updates: Partial<Education>): Promise<void> {
    const eduRef = doc(db, EDUCATION_COLLECTION, id);
    await updateDoc(eduRef, updates);
}

/**
 * Delete an education entry
 */
export async function deleteEducation(id: string): Promise<void> {
    const eduRef = doc(db, EDUCATION_COLLECTION, id);
    await deleteDoc(eduRef);
}

// ==================== ACHIEVEMENTS CRUD ====================

const ACHIEVEMENTS_COLLECTION = 'achievements';

/**
 * Get all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
    try {
        const achRef = collection(db, ACHIEVEMENTS_COLLECTION);
        const q = query(achRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Achievement));
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
}

/**
 * Subscribe to achievements (real-time)
 */
export function subscribeAchievements(
    callback: (achievements: Achievement[]) => void
): () => void {
    const achRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const q = query(achRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const achievements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Achievement));
        callback(achievements);
    }, (error) => {
        console.error('Error subscribing to achievements:', error);
        callback([]);
    });
}

/**
 * Add a new achievement
 */
export async function addAchievement(achievement: Omit<Achievement, 'id'>): Promise<string> {
    const achRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const docRef = await addDoc(achRef, achievement);
    return docRef.id;
}

/**
 * Update an achievement
 */
export async function updateAchievement(id: string, updates: Partial<Achievement>): Promise<void> {
    const achRef = doc(db, ACHIEVEMENTS_COLLECTION, id);
    await updateDoc(achRef, updates);
}

/**
 * Delete an achievement
 */
export async function deleteAchievement(id: string): Promise<void> {
    const achRef = doc(db, ACHIEVEMENTS_COLLECTION, id);
    await deleteDoc(achRef);
}

// ==================== SERVICES CRUD ====================

const SERVICES_COLLECTION = 'services';

/**
 * Get all services
 */
export async function getServices(): Promise<Service[]> {
    try {
        const servRef = collection(db, SERVICES_COLLECTION);
        const q = query(servRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Service));
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

/**
 * Subscribe to services (real-time)
 */
export function subscribeServices(
    callback: (services: Service[]) => void
): () => void {
    const servRef = collection(db, SERVICES_COLLECTION);
    const q = query(servRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const services = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Service));
        callback(services);
    }, (error) => {
        console.error('Error subscribing to services:', error);
        callback([]);
    });
}

/**
 * Add a new service
 */
export async function addService(service: Omit<Service, 'id'>): Promise<string> {
    const servRef = collection(db, SERVICES_COLLECTION);
    const docRef = await addDoc(servRef, service);
    return docRef.id;
}

/**
 * Update a service
 */
export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
    const servRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(servRef, updates);
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<void> {
    const servRef = doc(db, SERVICES_COLLECTION, id);
    await deleteDoc(servRef);
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

