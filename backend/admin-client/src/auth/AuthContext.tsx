import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
  } from 'react';
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
    activeProfile: Profile | null;
    user: User | null;
    profiles: Profile[];
    activeProfileId: number | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    logoutProfile: (profileId: number) => void;
    logoutAll: () => void;
    switchProfile: (profileId: number) => void;
    addProfile: (email: string, password: string) => Promise<void>;
    isAuthenticated: boolean | null;
    authLoading: boolean;
    isLoading: boolean;
    profileChangeToken: number;
    isSwitchingProfile: boolean;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  const PROFILES_STORAGE_KEY = 'admin_profiles';
  const ACTIVE_PROFILE_ID_KEY = 'active_profile_id';
  const PROFILES_UPDATED_EVENT = 'auth:profiles-updated';
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [profileChangeToken, setProfileChangeToken] = useState<number>(Date.now());
    const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);
  
    const emitProfilesUpdated = useCallback(() => {
      window.dispatchEvent(new Event(PROFILES_UPDATED_EVENT));
    }, []);
  
    const activeProfile = useMemo(() => {
      if (!activeProfileId) return null;
      return profiles.find((p) => p.id === activeProfileId) || null;
    }, [profiles, activeProfileId]);
  
    const activeUser = useMemo(() => {
      return activeProfile?.user || null;
    }, [activeProfile]);
  
    const rehydrateProfiles = useCallback(
        async (validateToken: boolean = false) => {
          setAuthLoading(true);
          try {
            const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
            const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
      
            if (!savedProfiles) {
              // В хранилище вообще нет профилей — просто считаем, что не авторизованы
              setIsAuthenticated(false);
              return;
            }
      
            const parsedProfiles: Profile[] = JSON.parse(savedProfiles);
      
            if (parsedProfiles.length === 0) {
              // В хранилище пустой массив — тоже не авторизованы, НО localStorage не трогаем
              setIsAuthenticated(false);
              return;
            }
      
            setProfiles(parsedProfiles);
      
            let nextActiveId: number | null = null;
      
            if (savedActiveId) {
              const activeId = parseInt(savedActiveId, 10);
              const profile = parsedProfiles.find(p => p.id === activeId);
              if (profile) nextActiveId = activeId;
            }
      
            if (nextActiveId === null) {
              nextActiveId = parsedProfiles[0].id;
            }
      
            const nextProfile = parsedProfiles.find(p => p.id === nextActiveId) || null;
      
            if (nextProfile) {
              setActiveProfileId(nextActiveId);
              axios.defaults.headers.common['Authorization'] =
                `Bearer ${nextProfile.accessToken}`;
      
              if (validateToken) {
                try {
                  await axios.get('/api/auth/profile');
                } catch {
                  setIsAuthenticated(false);
                  return;
                }
              }
      
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
      
            setProfileChangeToken(Date.now());
          } catch (error) {
            console.error('Failed to load profiles:', error);
            setIsAuthenticated(false);
          } finally {
            setAuthLoading(false);
          }
        },
        []
      );
      
      
      
  
    useEffect(() => {
      rehydrateProfiles(false);
    }, [rehydrateProfiles]);
  
    useEffect(() => {
      const handleProfilesUpdated = () => rehydrateProfiles(false);
      window.addEventListener(PROFILES_UPDATED_EVENT, handleProfilesUpdated);
      return () => window.removeEventListener(PROFILES_UPDATED_EVENT, handleProfilesUpdated);
    }, [rehydrateProfiles]);
  
    useEffect(() => {
        if (profiles.length > 0) {
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        }
        // если профилей нет — здесь НИЧЕГО не делаем
      }, [profiles]);
      
      
      useEffect(() => {
        if (activeProfileId !== null) {
          localStorage.setItem(ACTIVE_PROFILE_ID_KEY, activeProfileId.toString());
        }
      }, [activeProfileId]);
      
  
    useEffect(() => {
      if (activeProfileId !== null) {
        const activeProfile = profiles.find((p) => p.id === activeProfileId);
        if (activeProfile) {
          axios.defaults.headers.common['Authorization'] =
            `Bearer ${activeProfile.accessToken}`;
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    }, [activeProfileId, profiles]);
  
    const login = async (email: string, password: string) => {
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
  
      const existingProfile = profiles.find((p) => p.user.email === email);
      if (existingProfile) {
        const updatedProfiles = profiles.map((p) =>
          p.id === existingProfile.id
            ? { ...p, user: userData, accessToken: access_token }
            : p
        );
        setProfiles(updatedProfiles);
        setActiveProfileId(existingProfile.id);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedProfiles));
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, existingProfile.id.toString());
      } else {
        const newProfileId = Date.now();
        const newProfile: Profile = {
          id: newProfileId,
          user: userData,
          accessToken: access_token,
        };
  
        const updatedProfiles = (() => {
          const existingUserId = profiles.find((p) => p.user.id === userData.id);
          if (existingUserId) {
            return profiles.map((p) =>
              p.user.id === userData.id
                ? { ...p, user: userData, accessToken: access_token }
                : p
            );
          }
          return [...profiles, newProfile];
        })();
  
        setProfiles(updatedProfiles);
        setActiveProfileId(newProfileId);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedProfiles));
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, newProfileId.toString());
      }
      setIsAuthenticated(true);
      setAuthLoading(false);
      setProfileChangeToken(Date.now());
      setIsSwitchingProfile(false);
      emitProfilesUpdated();
    };
  
    const addProfile = async (email: string, password: string) => {
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
  
      const newProfileId = Date.now();
      const newProfile: Profile = {
        id: newProfileId,
        user: userData,
        accessToken: access_token,
      };
  
      const updatedProfiles = (() => {
        const existingProfile = profiles.find((p) => p.user.email === email);
        if (existingProfile) {
          return profiles.map((p) =>
            p.id === existingProfile.id
              ? { ...p, user: userData, accessToken: access_token }
              : p
          );
        }
        const existingUserId = profiles.find((p) => p.user.id === userData.id);
        if (existingUserId) {
          return profiles.map((p) =>
            p.user.id === userData.id
              ? { ...p, user: userData, accessToken: access_token }
              : p
          );
        }
        return [...profiles, newProfile];
      })();
  
      setProfiles(updatedProfiles);
      setActiveProfileId(newProfileId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedProfiles));
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, newProfileId.toString());
      setIsAuthenticated(true);
      setAuthLoading(false);
      setProfileChangeToken(Date.now());
      setIsSwitchingProfile(false);
      emitProfilesUpdated();
    };
  
    const switchProfile = (profileId: number) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return;
  
      setIsSwitchingProfile(true);
      setIsAuthenticated(true);
  
      if (profileId === activeProfileId) {
        setProfileChangeToken(Date.now());
        setIsSwitchingProfile(false);
        return;
      }
  
      setActiveProfileId(profileId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${profile.accessToken}`;
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId.toString());
      setProfileChangeToken(Date.now());
      emitProfilesUpdated();
      setTimeout(() => setIsSwitchingProfile(false), 150);
    };
  
    const logoutProfile = (profileId: number) => {
      const wasActive = activeProfileId === profileId;
  
      setProfiles((prev) => {
        const remaining = prev.filter((p) => p.id !== profileId);
  
        if (remaining.length === 0) {
          localStorage.removeItem(PROFILES_STORAGE_KEY);
          localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
        }
  
        if (wasActive) {
          if (remaining.length > 0) {
            const nextProfile = remaining[0];
            setActiveProfileId(nextProfile.id);
            axios.defaults.headers.common['Authorization'] =
              `Bearer ${nextProfile.accessToken}`;
            setIsAuthenticated(true);
          } else {
            setActiveProfileId(null);
            delete axios.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
          }
        }
  
        return remaining;
      });
      setProfileChangeToken(Date.now());
      emitProfilesUpdated();
    };
  
    const logout = () => {
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
      setIsAuthenticated(false);
      setAuthLoading(false);
      setProfileChangeToken(Date.now());
      emitProfilesUpdated();
    };
  
    return (
      <AuthContext.Provider
        value={{
          activeProfile,
          user: activeUser,
          profiles,
          activeProfileId,
          login,
          logout,
          logoutProfile,
          logoutAll,
          switchProfile,
          addProfile,
          isAuthenticated,
          authLoading,
          isLoading: authLoading,
          profileChangeToken,
          isSwitchingProfile,
        }}
      >
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
  