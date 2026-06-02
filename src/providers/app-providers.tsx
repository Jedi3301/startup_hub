"use client";

import * as React from "react";
import { NextUIProvider, Button } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export interface UserState {
  id: string;
  legalName: string;
  email: string;
  role: "Founder" | "Contributor" | "Admin";
}

interface AuthContextType {
  user: UserState | null;
  initialized: boolean;
  login: (user: UserState) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserState | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    setInitialized(true);
  }, []);

  const login = (userData: UserState) => {
    setUser(userData);
    localStorage.setItem("current_user", JSON.stringify(userData));
    document.cookie = "session_token=mock_session_token; path=/; max-age=86400";
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  };

  return (
    <AuthContext.Provider value={{ user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md w-full p-8 rounded-2xl border border-danger/20 bg-danger-50/10 backdrop-blur-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-default-500 text-sm">
                An unexpected system error has occurred. Our engineers have been notified.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-left text-xs bg-default-100 p-4 rounded-lg overflow-x-auto max-h-40 border border-divider text-danger font-mono">
                {this.state.error.toString()}
              </pre>
            )}
            <Button
              color="danger"
              variant="flat"
              onPress={this.handleReset}
              className="w-full font-semibold"
            >
              Return to Safety
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
