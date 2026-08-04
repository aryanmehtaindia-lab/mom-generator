"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MeetingData } from "../types";
import { supabase } from "../utils/supabase";

interface MeetingContextType {
  meetings: MeetingData[];
  loading: boolean;
  addMeeting: (meeting: MeetingData) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  getMeeting: (id: string) => MeetingData | undefined;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all meetings from Supabase on mount
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map snake_case DB columns back to camelCase
        setMeetings(data.map(dbToMeeting));
      }
      setLoading(false);
    };

    fetchMeetings();

    // Real-time subscription — any insert/delete on the table updates all clients instantly
    const channel = supabase
      .channel("meetings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, () => {
        fetchMeetings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addMeeting = async (meeting: MeetingData) => {
    const { error } = await supabase.from("meetings").insert([meetingToDb(meeting)]);
    if (error) throw new Error(error.message);
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) throw new Error(error.message);
  };

  const getMeeting = (id: string) => meetings.find((m) => m.id === id);

  return (
    <MeetingContext.Provider value={{ meetings, loading, addMeeting, deleteMeeting, getMeeting }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetings() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeetings must be used within MeetingProvider");
  return ctx;
}

// ─── Helpers: map camelCase ↔ snake_case ───────────────────────────────────

function meetingToDb(m: MeetingData) {
  return {
    id: m.id,
    created_at: m.createdAt,
    participant: m.participant,
    meeting_time: m.meetingTime,
    meeting_date: m.meetingDate,
    company_name: m.companyName,
    meeting_with: m.meetingWith,
    designation: m.designation,
    industry: m.industry,
    location: m.location,
    total_employees: m.totalEmployees,
    currently_using: m.currentlyUsing,
    other_remarks: m.otherRemarks,
    plan: m.plan,
    lead_creation: m.leadCreation,
    lead_assignment: m.leadAssignment,
    follow_up_management: m.followUpManagement,
    customer_management: m.customerManagement,
    quotation_management: m.quotationManagement,
    task_reminder_management: m.taskReminderManagement,
    lead_sources: m.leadSources,
    follow_up_process: m.followUpProcess,
    whatsapp_email_integration: m.whatsappEmailIntegration,
    mobile_app_requirements: m.mobileAppRequirements,
    reports_dashboard: m.reportsDashboard,
    data_migrations: m.dataMigrations,
    customization_requirements: m.customizationRequirements,
    next_follow_up_date: m.nextFollowUpDate,
    remarks: m.remarks,
  };
}

function dbToMeeting(d: Record<string, string>): MeetingData {
  return {
    id: d.id,
    createdAt: d.created_at,
    participant: d.participant,
    meetingTime: d.meeting_time,
    meetingDate: d.meeting_date,
    companyName: d.company_name,
    meetingWith: d.meeting_with,
    designation: d.designation,
    industry: d.industry,
    location: d.location,
    totalEmployees: d.total_employees,
    currentlyUsing: d.currently_using,
    otherRemarks: d.other_remarks,
    plan: d.plan,
    leadCreation: d.lead_creation,
    leadAssignment: d.lead_assignment,
    followUpManagement: d.follow_up_management,
    customerManagement: d.customer_management,
    quotationManagement: d.quotation_management,
    taskReminderManagement: d.task_reminder_management,
    leadSources: d.lead_sources,
    followUpProcess: d.follow_up_process,
    whatsappEmailIntegration: d.whatsapp_email_integration,
    mobileAppRequirements: d.mobile_app_requirements,
    reportsDashboard: d.reports_dashboard,
    dataMigrations: d.data_migrations,
    customizationRequirements: d.customization_requirements,
    nextFollowUpDate: d.next_follow_up_date,
    remarks: d.remarks,
  };
}
