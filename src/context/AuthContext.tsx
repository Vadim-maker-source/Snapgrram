import { getCurrentUser } from '@/lib/appwrite/api';
import { IContextType, IUser } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER = {
  id: '',
  name: '',
  username:'',
  email: '',
  imageUrl: '',
  bio: ''
};

export const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
}

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER)
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const checkAuthUser = async (): Promise<boolean> => {
    try {
      setIsLoading(true); // Начинаем загрузку, пока выполняется запрос.
  
      const currentAccount = await getCurrentUser(); // Получаем текущего пользователя.
  
      if (currentAccount) {
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        });
        
        setIsAuthenticated(true); // Если пользователь найден, ставим его как аутентифицированного.
        return true; // Возвращаем true, если пользователь найден.
      }
  
      return false; // Если пользователь не найден, возвращаем false.
    } catch (error) {
      console.error("Error checking user:", error); // Логируем ошибку для отладки.
      return false; // В случае ошибки, возвращаем false (неаутентифицирован).
    } finally {
      setIsLoading(false); // Завершаем загрузку.
    }
  };

  useEffect(() => {
    if(
      localStorage.getItem('cookieFallback') === '[]' || localStorage.getItem('cookieFallback') === null
    ) navigate('/sign-in')

    checkAuthUser();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);