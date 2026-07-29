"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MeetingData } from "../types";

interface MeetingContextType {
  meetings: MeetingData[];
  addMeeting: (meeting: MeetingData) => void;
  deleteMeeting: (id: string) => void;
  getMeeting: (id: string) => MeetingData | undefined;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<MeetingData[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mom-meetings");
    if (saved) setMeetings(JSON.parse(saved));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("mom-meetings", JSON.stringify(meetings));
  }, [meetings]);

  const addMeeting = (meeting: MeetingData) => {
    setMeetings((prev) => [meeting, ...prev]);
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const getMeeting = (id: string) => meetings.find((m) => m.id === id);

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, deleteMeeting, getMeeting }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetings() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeetings must be used within MeetingProvider");
  return ctx;
}
