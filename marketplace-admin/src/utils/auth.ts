const TOKEN_KEY = 'marketplace_admin_token';

export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      // JWT 토큰의 만료 시간 확인
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  getUserFromToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        studentId: payload.sub,
        role: payload.role
      };
    } catch {
      return null;
    }
  }
};