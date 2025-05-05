import { Delta } from 'quill';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          role: 'member' | 'pastor' | 'minister' | 'admin'
          avatar_url: string | null
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          role?: 'member' | 'pastor' | 'minister' | 'admin'
          avatar_url?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          role?: 'member' | 'pastor' | 'minister' | 'admin'
          avatar_url?: string | null
          phone?: string | null
        }
      }
      prayer_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          category: string
          status: 'pending' | 'in_progress' | 'completed'
          is_anonymous: boolean
          user_id: string
          completion_message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          category: string
          status?: 'pending' | 'in_progress' | 'completed'
          is_anonymous?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          category?: string
          status?: 'pending' | 'in_progress' | 'completed'
          is_anonymous?: boolean
          user_id?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          location: string
          type: 'in_person' | 'online' | 'hybrid'
          max_attendees: number | null
          needs_volunteers: boolean
          created_at: string
          updated_at: string
          image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_time: string
          end_time: string
          location: string
          type: 'in_person' | 'online' | 'hybrid'
          max_attendees?: number | null
          needs_volunteers?: boolean
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          location?: string
          type?: 'in_person' | 'online' | 'hybrid'
          max_attendees?: number | null
          needs_volunteers?: boolean
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registration_type: 'attendee' | 'volunteer'
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registration_type: 'attendee' | 'volunteer'
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registration_type?: 'attendee' | 'volunteer'
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: 'pending' | 'confirmed' | 'cancelled'
          payment_method: string
          payment_reference: string | null
          notes: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_method: string
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_method?: string
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          variables: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          variables?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          variables?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          template_id: string
          recipient_email: string
          subject: string
          body: string
          status: 'pending' | 'sent' | 'failed'
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          recipient_email: string
          subject: string
          body: string
          status?: 'pending' | 'sent' | 'failed'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          recipient_email?: string
          subject?: string
          body?: string
          status?: 'pending' | 'sent' | 'failed'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      blog_articles: {
        Row: BlogArticle;
        Insert: Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>>;
      };
      blog_tags: {
        Row: BlogTag;
        Insert: Omit<BlogTag, 'id' | 'created_at'>;
        Update: Partial<Omit<BlogTag, 'id' | 'created_at'>>;
      };
      blog_article_tags: {
        Row: BlogArticleTag;
        Insert: BlogArticleTag;
        Update: BlogArticleTag;
      };
    }
  }
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  

  content: Delta; // Quill Delta format
  cover_image: string | null;
  author_id: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogArticleTag {
  article_id: string;
  tag_id: string;
}