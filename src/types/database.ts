export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'normal' | 'medium' | 'high'
export type IncidentPriority = 'normal' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'in_progress' | 'resolved'
export type ShiftAssignmentStatus = 'confirmed' | 'waitlist' | 'cancelled'
export type AvailabilityStatus = 'available' | 'maybe' | 'unavailable'
export type CalendarEventVisibility = 'crew' | 'team' | 'private'
export type ConversationType = 'direct' | 'group'

export type Database = {
  public: {
    Tables: {
      KT_profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          phone: string | null
          bio: string | null
          skills: string[]
          emergency_contact: string | null
          active: boolean
          last_seen: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          skills?: string[]
          emergency_contact?: string | null
          active?: boolean
          last_seen?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          skills?: string[]
          emergency_contact?: string | null
          active?: boolean
          last_seen?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_roles: {
        Row: {
          id: string
          name: string
          system_role: boolean
          rank: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          system_role?: boolean
          rank?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          system_role?: boolean
          rank?: number
          created_at?: string
        }
        Relationships: []
      }
      KT_permissions: {
        Row: {
          id: string
          key: string
          description: string | null
        }
        Insert: {
          id?: string
          key: string
          description?: string | null
        }
        Update: {
          id?: string
          key?: string
          description?: string | null
        }
        Relationships: []
      }
      KT_user_roles: {
        Row: {
          user_id: string
          role_id: string
        }
        Insert: {
          user_id: string
          role_id: string
        }
        Update: {
          user_id?: string
          role_id?: string
        }
        Relationships: []
      }
      KT_role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id: string
          permission_id: string
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
        Relationships: []
      }
      KT_teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_team_members: {
        Row: {
          team_id: string
          user_id: string
          is_lead: boolean
        }
        Insert: {
          team_id: string
          user_id: string
          is_lead?: boolean
        }
        Update: {
          team_id?: string
          user_id?: string
          is_lead?: boolean
        }
        Relationships: []
      }
      KT_invitations: {
        Row: {
          id: string
          email: string
          invited_by: string | null
          token_hash: string
          role_id: string | null
          team_id: string | null
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          invited_by?: string | null
          token_hash: string
          role_id?: string | null
          team_id?: string | null
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string | null
          token_hash?: string
          role_id?: string | null
          team_id?: string | null
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_conversations: {
        Row: {
          id: string
          type: ConversationType
          title: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: ConversationType
          title?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: ConversationType
          title?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      KT_conversation_members: {
        Row: {
          conversation_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          conversation_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          conversation_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string | null
        }
        Relationships: []
      }
      KT_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          body: string
          reply_to: string | null
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          body: string
          reply_to?: string | null
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string | null
          body?: string
          reply_to?: string | null
          edited_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_message_reactions: {
        Row: {
          message_id: string
          user_id: string
          emoji: string
        }
        Insert: {
          message_id: string
          user_id: string
          emoji: string
        }
        Update: {
          message_id?: string
          user_id?: string
          emoji?: string
        }
        Relationships: []
      }
      KT_message_attachments: {
        Row: {
          id: string
          message_id: string
          storage_path: string
          file_name: string
          mime_type: string | null
          size_bytes: number | null
        }
        Insert: {
          id?: string
          message_id: string
          storage_path: string
          file_name: string
          mime_type?: string | null
          size_bytes?: number | null
        }
        Update: {
          id?: string
          message_id?: string
          storage_path?: string
          file_name?: string
          mime_type?: string | null
          size_bytes?: number | null
        }
        Relationships: []
      }
      KT_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          due_at: string | null
          team_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_at?: string | null
          team_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_at?: string | null
          team_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      KT_task_assignees: {
        Row: {
          task_id: string
          user_id: string
        }
        Insert: {
          task_id: string
          user_id: string
        }
        Update: {
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      KT_subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          done: boolean
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          done?: boolean
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          done?: boolean
        }
        Relationships: []
      }
      KT_task_comments: {
        Row: {
          id: string
          task_id: string
          author_id: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_id?: string | null
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_id?: string | null
          body?: string
          created_at?: string
        }
        Relationships: []
      }
      KT_task_activity: {
        Row: {
          id: string
          task_id: string
          user_id: string | null
          event_type: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id?: string | null
          event_type?: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string | null
          event_type?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      KT_documents: {
        Row: {
          id: string
          name: string
          storage_path: string
          mime_type: string | null
          size_bytes: number
          folder: string
          category: string | null
          team_id: string | null
          task_id: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          storage_path: string
          mime_type?: string | null
          size_bytes?: number
          folder?: string
          category?: string | null
          team_id?: string | null
          task_id?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          storage_path?: string
          mime_type?: string | null
          size_bytes?: number
          folder?: string
          category?: string | null
          team_id?: string | null
          task_id?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Relationships: []
      }
      KT_locations: {
        Row: {
          id: string
          name: string
          description: string | null
          map_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          map_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          map_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_artists: {
        Row: {
          id: string
          name: string
          genre: string | null
          contact: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          genre?: string | null
          contact?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          genre?: string | null
          contact?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_timetable: {
        Row: {
          id: string
          artist_id: string | null
          location_id: string | null
          starts_at: string
          ends_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          artist_id?: string | null
          location_id?: string | null
          starts_at: string
          ends_at: string
          notes?: string | null
        }
        Update: {
          id?: string
          artist_id?: string | null
          location_id?: string | null
          starts_at?: string
          ends_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      KT_shifts: {
        Row: {
          id: string
          title: string
          location_id: string | null
          starts_at: string
          ends_at: string
          needed: number
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          location_id?: string | null
          starts_at: string
          ends_at: string
          needed?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          location_id?: string | null
          starts_at?: string
          ends_at?: string
          needed?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_shift_assignments: {
        Row: {
          shift_id: string
          user_id: string
          status: ShiftAssignmentStatus
          created_at: string
        }
        Insert: {
          shift_id: string
          user_id: string
          status?: ShiftAssignmentStatus
          created_at?: string
        }
        Update: {
          shift_id?: string
          user_id?: string
          status?: ShiftAssignmentStatus
          created_at?: string
        }
        Relationships: []
      }
      KT_availability: {
        Row: {
          user_id: string
          date: string
          status: AvailabilityStatus
          note: string | null
        }
        Insert: {
          user_id: string
          date: string
          status: AvailabilityStatus
          note?: string | null
        }
        Update: {
          user_id?: string
          date?: string
          status?: AvailabilityStatus
          note?: string | null
        }
        Relationships: []
      }
      KT_checkins: {
        Row: {
          id: string
          user_id: string
          shift_id: string | null
          checked_in_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shift_id?: string | null
          checked_in_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shift_id?: string | null
          checked_in_at?: string
        }
        Relationships: []
      }
      KT_incidents: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: IncidentPriority
          status: IncidentStatus
          team_id: string | null
          location_id: string | null
          reported_by: string
          assigned_to: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: IncidentPriority
          status?: IncidentStatus
          team_id?: string | null
          location_id?: string | null
          reported_by: string
          assigned_to?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: IncidentPriority
          status?: IncidentStatus
          team_id?: string | null
          location_id?: string | null
          reported_by?: string
          assigned_to?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      KT_calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          starts_at: string
          ends_at: string
          location_id: string | null
          location_text: string | null
          team_id: string | null
          visibility: CalendarEventVisibility
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          starts_at: string
          ends_at: string
          location_id?: string | null
          location_text?: string | null
          team_id?: string | null
          visibility?: CalendarEventVisibility
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          starts_at?: string
          ends_at?: string
          location_id?: string | null
          location_text?: string | null
          team_id?: string | null
          visibility?: CalendarEventVisibility
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      KT_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      KT_crew_contacts: {
        Row: {
          id: string
          name: string
          role: string | null
          phone: string | null
          email: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          phone?: string | null
          email?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          phone?: string | null
          email?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      KT_emergency_info: {
        Row: {
          id: string
          title: string
          body: string
          sort_order: number
        }
        Insert: {
          id?: string
          title: string
          body: string
          sort_order?: number
        }
        Update: {
          id?: string
          title?: string
          body?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      KT_has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      KT_has_permission: {
        Args: { permission_key: string }
        Returns: boolean
      }
      KT_join_shift: {
        Args: { p_shift_id: string }
        Returns: string
      }
      KT_leave_shift: {
        Args: { p_shift_id: string }
        Returns: string
      }
      KT_check_in_shift: {
        Args: { p_shift_id: string }
        Returns: string
      }
      KT_shift_conflicts: {
        Args: { p_shift_id: string }
        Returns: {
          id: string
          title: string
          starts_at: string
          ends_at: string
        }[]
      }
      KT_create_direct: {
        Args: { other_user: string }
        Returns: string
      }
      KT_create_group: {
        Args: { group_title: string; member_ids: string[] }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
