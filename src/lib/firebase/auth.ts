import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// User roles for RBAC
export type UserRole = 'admin' | 'player' | 'user' | 'guest' | 'vip' | 'beta_tester' | 'friend';

// User profile interface
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    createdAt: Date;
    lastLoginAt: Date;
}

/**
 * Create user profile in Firestore after registration
 * Roles are managed via Firebase Console -> Firestore -> users collection
 */
async function createUserProfile(firebaseUser: User, role: UserRole = 'user'): Promise<void> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        });
    } else {
        // Update last login
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(userCredential.user, 'user');

    return userCredential;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user); // Updates last login
    return userCredential;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createUserProfile(userCredential.user);
    return userCredential;
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub(): Promise<UserCredential> {
    const userCredential = await signInWithPopup(auth, githubProvider);
    await createUserProfile(userCredential.user);
    return userCredential;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
    return firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
}

/**
 * Check if user has required role (RBAC)
 */
export async function hasRole(uid: string, requiredRole: UserRole): Promise<boolean> {
    const profile = await getUserProfile(uid);
    if (!profile) return false;

    // Role hierarchy: admin > player > guest
    const roleHierarchy: Record<UserRole, number> = {
        admin: 10,
        vip: 5,
        beta_tester: 4,
        friend: 3,
        player: 2,
        user: 1,
        guest: 0,
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
}

/**
 * Update user role (admin only function)
 */
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { role: newRole }, { merge: true });
}

/**
 * Update user display name (in-game name)
 */
export async function updateDisplayName(newDisplayName: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: newDisplayName });

    // Update Firestore profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { displayName: newDisplayName }, { merge: true });
}
