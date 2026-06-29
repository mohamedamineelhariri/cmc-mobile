export interface User {
  id: string;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: "super_admin" | "director" | "teacher" | "student_affairs" | "communication" | "moderator" | "student";
  is_admin?: boolean;
  is_active: boolean;
  created_at: string;
  student_id?: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  speciality?: string;
  status?: string;
}

export interface Student {
  id: string;
  user_id: string;
  cne: string;
  cni?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  filiere_id: string;
  filiere_name?: string;
  level: string;
  group_name?: string;
  enrollment_year: number;
  status: string;
}

export interface Schedule {
  id: string;
  module_id: string;
  module_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  group_name?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
  type?: string;
}

export interface Grade {
  id: string;
  student_id: string;
  module_id: string;
  module_name?: string;
  exam_name?: string;
  score: number;
  coefficient?: number;
  semester: number;
  academic_year: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  module_id: string;
  module_name?: string;
  date?: string;
  status: "present" | "absent" | "late" | "excused";
  created_at: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category?: string;
  target_role?: string;
  is_pinned: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at?: string;
  event?: Event;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  category?: string;
  organizer?: string;
}

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  title?: string;
  message?: string;
  created_at: string;
  notification?: {
    title: string;
    body: string;
    created_at: string;
  };
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  category?: string;
  member_count?: number;
  logo_url?: string;
}

export interface InternshipOffer {
  id: string;
  company_name: string;
  title: string;
  description?: string;
  requirements?: string;
  duration?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at?: string;
}

export interface InternshipApplication {
  id: string;
  offer_id: string;
  student_id: string;
  status: string;
  cv_url?: string;
  cover_letter?: string;
  feedback?: string;
  created_at?: string;
  offer?: InternshipOffer;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  image_urls?: string[];
  status: string;
  created_at?: string;
  seller_id?: string;
}

export interface LostFoundItem {
  id: string;
  type: "lost" | "found";
  title: string;
  description?: string;
  location_found?: string;
  status: string;
  image_url?: string;
  created_at?: string;
  reporter_id?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  folder?: string;
  is_published: boolean;
  created_at?: string;
}
