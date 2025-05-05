import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Settings {
  paystackPublicKey: string;
  paystackSecretKey: string;
}

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useSettings = create<SettingsStore>((set) => ({
  settings: {
    paystackPublicKey: '',
    paystackSecretKey: ''
  },
  loading: false,

  fetchSettings: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      set({ settings: data || {} });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...newSettings });

      if (error) throw error;
      set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));