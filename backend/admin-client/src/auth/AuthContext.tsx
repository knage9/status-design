import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface Profile {
    id: number;
    user: User;
    accessToken: string;
}

interface AuthContextType {
    user: User | null; // Active user (backward compatibility)
    profiles: Profile[];
    activeProfileId: number | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    logoutProfile: (profileId: number) => void;
    logoutAll: () => void;
    switchProfile: (profileId: number) => void;
    addProfile: (email: string, password: string) => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILES_STORAGE_KEY = 'admin_profiles';
const ACTIVE_PROFILE_ID_KEY = 'active_profile_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Active user computed from active profile (backward compatibility)
    const activeUser = useMemo(() => {
        if (!activeProfileId) return null;
        const profile = profiles.find(p => p.id === activeProfileId);
        return profile?.user || null;
    }, [profiles, activeProfileId]);

    // Load profiles from localStorage on mount
    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
                const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);

                if (savedProfiles) {
                    const parsedProfiles: Profile[] = JSON.parse(savedProfiles);
                    setProfiles(parsedProfiles);

                    if (savedActiveId) {
                        const activeId = parseInt(savedActiveId);
                        const activeProfile = parsedProfiles.find(p => p.id === activeId);
                        
                        if (activeProfile) {
                            setActiveProfileId(activeId);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${activeProfile.accessToken}`;
                            // Verify token is still valid
                            try {
                                await axios.get('/api/auth/profile');
                            } catch (error) {
                                // Token expired, remove invalid profile
                                const remainingProfiles = parsedProfiles.filter(p => p.id !== activeId);
                                if (remainingProfiles.length > 0) {
                                    setProfiles(remainingProfiles);
                                    const firstProfile = remainingProfiles[0];
                                    setActiveProfileId(firstProfile.id);
                                    axios.defaults.headers.common['Authorization'] = `Bearer ${firstProfile.accessToken}`;
                                } else {
                                    setProfiles([]);
                                    setActiveProfileId(null);
                                    delete axios.defaults.headers.common['Authorization'];
                                    localStorage.removeItem(PROFILES_STORAGE_KEY);
                                    localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
                                }
                            }
                        } else {
                            // Active profile not found, use first available
                            if (parsedProfiles.length > 0) {
                                const firstProfile = parsedProfiles[0];
                                setActiveProfileId(firstProfile.id);
                                axios.defaults.headers.common['Authorization'] = `Bearer ${firstProfile.accessToken}`;
                            }
                        }
                    } else if (parsedProfiles.length > 0) {
                        // No active profile saved, use first
                        const firstProfile = parsedProfiles[0];
                        setActiveProfileId(firstProfile.id);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${firstProfile.accessToken}`;
                    }
                }
            } catch (error) {
                console.error('Failed to load profiles:', error);
                localStorage.removeItem(PROFILES_STORAGE_KEY);
                localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfiles();
    }, []);

    // Save profiles to localStorage whenever they change
    useEffect(() => {
        if (profiles.length > 0) {
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        } else {
            localStorage.removeItem(PROFILES_STORAGE_KEY);
        }
    }, [profiles]);

    // Save active profile ID to localStorage whenever it changes
    useEffect(() => {
        if (activeProfileId !== null) {
            localStorage.setItem(ACTIVE_PROFILE_ID_KEY, activeProfileId.toString());
        } else {
            localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
        }
    }, [activeProfileId]);

    // Update axios headers when active profile changes
    useEffect(() => {
        if (activeProfileId !== null) {
            const activeProfile = profiles.find(p => p.id === activeProfileId);
            if (activeProfile) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${activeProfile.accessToken}`;
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [activeProfileId, profiles]);


    const login = async (email: string, password: string) => {
        // Create axios instance without auth header for login request
        const loginAxios = axios.create({
            baseURL: axios.defaults.baseURL || '',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await loginAxios.post('/api/auth/login', {
            email,
            password,
        });

        const { access_token, user: userData } = response.data;

        // Check if profile already exists with this email
        const existingProfile = profiles.find(p => p.user.email === email);
        if (existingProfile) {
            // Update existing profile and switch to it
            setProfiles(prev => prev.map(p => 
                p.id === existingProfile.id 
                    ? { ...p, user: userData, accessToken: access_token }
                    : p
            ));
            setActiveProfileId(existingProfile.id);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } else {
            // Create new profile using addProfile logic
            const newProfileId = Date.now();
            const newProfile: Profile = {
                id: newProfileId,
                user: userData,
                accessToken: access_token,
            };

            setProfiles(prev => {
                // Check if user with same ID already exists
                const existingUserId = prev.find(p => p.user.id === userData.id);
                if (existingUserId) {
                    return prev.map(p => 
                        p.user.id === userData.id 
                            ? { ...p, user: userData, accessToken: access_token }
                            : p
                    );
                }
                return [...prev, newProfile];
            });

            setActiveProfileId(newProfileId);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        }
    };

    const addProfile = async (email: string, password: string) => {
        // Create axios instance without auth header for login request
        const loginAxios = axios.create({
            baseURL: axios.defaults.baseURL || '',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await loginAxios.post('/api/auth/login', {
            email,
            password,
        });

        const { access_token, user: userData } = response.data;

        // Generate new profile ID (use timestamp + user ID for uniqueness)
        const newProfileId = Date.now();
        const newProfile: Profile = {
            id: newProfileId,
            user: userData,
            accessToken: access_token,
        };

        setProfiles(prev => {
            // Check if profile with same email already exists
            const existingProfile = prev.find(p => p.user.email === email);
            if (existingProfile) {
                // Update existing profile instead of creating duplicate
                return prev.map(p => 
                    p.id === existingProfile.id
                        ? { ...p, user: userData, accessToken: access_token }
                        : p
                );
            }
            // Check if user with same ID already exists (different email variation)
            const existingUserId = prev.find(p => p.user.id === userData.id);
            if (existingUserId) {
                // Update existing profile
                return prev.map(p => 
                    p.user.id === userData.id 
                        ? { ...p, user: userData, accessToken: access_token }
                        : p
                );
            }
            return [...prev, newProfile];
        });

        setActiveProfileId(newProfileId);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    };

    const switchProfile = (profileId: number) => {
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            setActiveProfileId(profileId);
            axios.defaults.headers.common['Authorization'] = `Bearer ${profile.accessToken}`;
        }
    };

    const logoutProfile = (profileId: number) => {
        const wasActive = activeProfileId === profileId;
        
        // Remove profile and get remaining profiles
        setProfiles(prev => {
            const remaining = prev.filter(p => p.id !== profileId);
            
            if (remaining.length === 0) {
                localStorage.removeItem(PROFILES_STORAGE_KEY);
                localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
            }
            
            // If logged out profile was active, switch to another or clear
            if (wasActive) {
                if (remaining.length > 0) {
                    const nextProfile = remaining[0];
                    setActiveProfileId(nextProfile.id);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${nextProfile.accessToken}`;
                } else {
                    setActiveProfileId(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            
            return remaining;
        });
    };

    const logout = () => {
        // Logout current active profile (backward compatibility)
        if (activeProfileId !== null) {
            logoutProfile(activeProfileId);
        }
    };

    const logoutAll = () => {
        setProfiles([]);
        setActiveProfileId(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem(PROFILES_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    };

    return (
        <AuthContext.Provider value={{ 
            user: activeUser, 
            profiles, 
            activeProfileId,
            login, 
            logout, 
            logoutProfile,
            logoutAll,
            switchProfile,
            addProfile,
            isAuthenticated: !!activeUser, 
            isLoading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
