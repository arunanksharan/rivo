/**
 * Type declarations for modules without built-in TypeScript definitions
 */

// React Navigation
declare module '@react-navigation/native' {
  export interface NavigationProp<ParamList extends Record<string, object | undefined>> {
    navigate<RouteName extends keyof ParamList>(
      ...args: ParamList[RouteName] extends undefined
        ? [screen: RouteName]
        : [screen: RouteName, params: ParamList[RouteName]]
    ): void;
    goBack(): void;
    reset(state: object): void;
  }

  export interface RouteProp<
    ParamList extends Record<string, object | undefined>,
    RouteName extends keyof ParamList,
  > {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  }

  export function useNavigation<T = NavigationProp<Record<string, object | undefined>>>(): T;
  export function useRoute<T = RouteProp<Record<string, object | undefined>, string>>(): T;
  export const NavigationContainer: React.FC<
    React.PropsWithChildren<{
      theme?: object;
      linking?: object;
      fallback?: React.ReactNode;
      onReady?: () => void;
    }>
  >;
}

declare module '@react-navigation/native-stack' {
  export interface NativeStackNavigationOptions {
    title?: string;
    headerShown?: boolean;
    headerTransparent?: boolean;
    headerTintColor?: string;
    headerStyle?: object;
    headerTitleStyle?: object;
    animation?: string;
    presentation?: 'modal' | 'card' | 'transparentModal';
  }

  export function createNativeStackNavigator(): {
    Navigator: React.FC<
      React.PropsWithChildren<{
        initialRouteName?: string;
        screenOptions?:
          | NativeStackNavigationOptions
          | ((props: object) => NativeStackNavigationOptions);
      }>
    >;
    Screen: React.FC<{
      name: string;
      component: React.ComponentType<unknown>;
      options?: NativeStackNavigationOptions | ((props: object) => NativeStackNavigationOptions);
    }>;
  };

  export const NativeStackNavigationProp: unknown;
}

declare module '@react-navigation/bottom-tabs' {
  export interface BottomTabNavigationOptions {
    title?: string;
    tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    tabBarLabel?: string | ((props: { focused: boolean; color: string }) => React.ReactNode);
    tabBarBadge?: number | string;
    tabBarVisible?: boolean;
    tabBarStyle?: object;
  }

  export function createBottomTabNavigator(): {
    Navigator: React.FC<
      React.PropsWithChildren<{
        initialRouteName?: string;
        screenOptions?:
          | BottomTabNavigationOptions
          | ((props: object) => BottomTabNavigationOptions);
        tabBarOptions?: object;
      }>
    >;
    Screen: React.FC<{
      name: string;
      component: React.ComponentType<unknown>;
      options?: BottomTabNavigationOptions | ((props: object) => BottomTabNavigationOptions);
    }>;
  };
}

// Expo modules
declare module 'expo-status-bar' {
  export const StatusBar: React.FC<{ style: 'auto' | 'light' | 'dark' }>;
}

declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    cancelled: boolean;
    uri?: string;
    width?: number;
    height?: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }

  export interface ImagePickerOptions {
    mediaTypes?: string;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export const MediaTypeOptions: {
    Images: string;
    Videos: string;
    All: string;
  };

  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>;
  export function launchImageLibraryAsync(options: ImagePickerOptions): Promise<ImagePickerResult>;
}

declare module 'expo-speech' {
  export interface SpeechOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    voice?: string;
    volume?: number;
    onStart?: () => void;
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (error: Error) => void;
  }

  export interface Voice {
    identifier?: string;
    name: string;
    language: string;
    quality?: string;
  }

  export function speak(text: string, options?: SpeechOptions): void;
  export function stop(): void;
  export function getAvailableVoicesAsync(): Promise<Voice[]>;
  export function isSpeakingAsync(): Promise<boolean>;
}

// Vector icons
declare module '@expo/vector-icons' {
  export const Ionicons: React.FC<{
    name: string;
    size: number;
    color: string;
  }>;
}

// Storage
declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  };
  export default AsyncStorage;
}

// React Query
declare module '@tanstack/react-query' {
  export interface MutationOptions<TData = unknown, TError = Error, TVariables = unknown> {
    mutationFn?: (variables: TVariables) => Promise<TData>;
    onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
    onSuccess?: (data: TData, variables: TVariables) => Promise<unknown> | unknown;
    onError?: (error: TError, variables: TVariables) => Promise<unknown> | unknown;
    onSettled?: (
      data: TData | undefined,
      error: TError | null,
      variables: TVariables,
    ) => Promise<unknown> | unknown;
  }

  export interface QueryOptions<TData = unknown, TError = Error> {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnMount?: boolean | 'always';
    refetchOnWindowFocus?: boolean | 'always';
    refetchOnReconnect?: boolean | 'always';
    retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
    retryDelay?: number | ((retryAttempt: number, error: TError) => number);
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
    onSettled?: (data: TData | undefined, error: TError | null) => void;
  }

  export interface QueryResult<TData = unknown, TError = Error> {
    data: TData | undefined;
    error: TError | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    status: 'idle' | 'loading' | 'error' | 'success';
    refetch: () => Promise<QueryResult<TData, TError>>;
    remove: () => void;
  }

  export interface MutationResult<TData = unknown, TError = Error, TVariables = unknown> {
    data: TData | undefined;
    error: TError | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isIdle: boolean;
    status: 'idle' | 'loading' | 'error' | 'success';
    reset: () => void;
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;
  }

  export function useMutation<TData = unknown, TError = Error, TVariables = unknown>(
    options: MutationOptions<TData, TError, TVariables>,
  ): MutationResult<TData, TError, TVariables>;

  export interface QueryClient {
    invalidateQueries: (queryKey: unknown[] | { queryKey: unknown[] }) => Promise<void>;
    setQueryData: <T>(queryKey: unknown[], updater: T | ((oldData: T | undefined) => T)) => void;
    getQueryData: <T>(queryKey: unknown[]) => T | undefined;
  }

  export const QueryClient: {
    new (config?: object): QueryClient;
  };

  export const QueryClientProvider: React.FC<
    React.PropsWithChildren<{
      client: QueryClient;
    }>
  >;

  export function useQueryClient(): QueryClient;

  export function useQuery<TData = unknown, TError = Error>(
    queryKey: unknown[],
    queryFn: () => Promise<TData>,
    options?: QueryOptions<TData, TError>,
  ): QueryResult<TData, TError>;
}

// Custom module paths
declare module '@/navigation' {
  export interface MainStackParamList {
    // Add your stack navigation params here
    Home: undefined;
    PropertyDetails: { id: string };
    Search: undefined;
    Saved: undefined;
    Profile: undefined;
    EditProfile: undefined;
    ChangePassword: undefined;
    Notifications: undefined;
    VoiceAssistant: undefined;
    VoiceAssistantSettings: undefined;
  }

  export interface AuthStackParamList {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
  }

  export const Navigation: React.FC;
}

declare module '@/providers/AuthProvider' {
  export interface User {
    id: string;
    email: string;
    role: string;
    preferences?: Record<string, unknown>;
  }

  export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    preferences?: Record<string, unknown>;
  }

  export interface SignInCredentials {
    email: string;
    password: string;
  }

  export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
  }

  export interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => void;
  }

  export function useAuth(): AuthContextType;
  export const AuthProvider: React.FC<React.PropsWithChildren<unknown>>;
}

declare module '@/providers/ThemeProvider' {
  export interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    theme: {
      colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
      };
    };
  }

  export function useTheme(): ThemeContextType;
  export const ThemeProvider: React.FC<React.PropsWithChildren<unknown>>;
}

declare module '@/store/useVoiceStore' {
  export interface VoiceSettings {
    enabled: boolean;
    voice_type: string;
    voice_id?: string;
    rate?: number;
    pitch?: number;
  }

  export function useVoiceStore(): {
    settings: VoiceSettings;
    updateSettings: (settings: Partial<VoiceSettings>) => void;
  };
}

declare module '@/services/api/users' {
  export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    preferences: Record<string, unknown>;
  }

  export function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile>;
  export function updateUserPreferences(
    preferences: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  export function fetchNotificationSettings(): Promise<Record<string, boolean>>;
  export function updateNotificationSettings(
    settings: Record<string, boolean>,
  ): Promise<Record<string, boolean>>;
}
