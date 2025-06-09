import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwkyqchyuihmgpvqosvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3lxY2h5dWlobWdwdnFvc3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTU1MTksImV4cCI6MjA2NDg5MTUxOX0.Gmwe2GFN4oN7udh_ZnZJTefSa1RZdzzB7pqUBfHok7s';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const authService = {
  // Реєстрація
  async signUp(email: string, password: string, userData: { name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Вхід
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Вихід
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Отримати поточного користувача
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Оновлення профілю
  async updateProfile(updates: { display_name?: string; email?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: updates.display_name
      },
      email: updates.email
    });
    
    if (error) throw error;
    return data;
  },

  // Зміна пароля
  async changePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return data;
  },

  // Підписка на зміни авторизації
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}; 