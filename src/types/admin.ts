export interface AdminDashboardStats {
  totalTests: number;
  totalQuestions: number;
  totalBlogs: number;
  /** Leads captured from /open/2026-mppsc-prelims */
  openPyq2026LeadCount?: number;
  typeCount: {
    FLT: number;
    UNIT: number;
    TOPIC: number;
    CSAT: number;
    PYQ: number;
    [key: string]: number;
  };
  blogCategoryCount: Record<string, number>;
}

export interface RecentUpload {
  id: string;
  type: string | null;
  title: string;
  unitId: string | null;
  topicId: string | null;
  totalQuestions: number | null;
  updatedAt: Date | null;
}

export interface RecentGuest {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  createdAt: Date | null;
  /** e.g. open_pyq_2026, free_quiz */
  leadSource?: string | null;
}

export interface AdminDashboardResponse {
  success: boolean;
  stats?: AdminDashboardStats;
  recentUploads?: RecentUpload[];
  recentBlogs?: any[];
  recentGuests?: RecentGuest[];
  /** Latest guests from open PYQ 2026 public page */
  recentOpenPyqLeads?: RecentGuest[];
  topicCoverage?: Record<string, string[]>;
  error?: string;
}
