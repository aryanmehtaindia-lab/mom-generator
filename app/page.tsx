"use client";

import { useState } from "react";
import Link from "next/link";
import { useMeetings } from "./context/MeetingContext";
import { generatePDF } from "./utils/generatePDF";
import { generateDOCX } from "./utils/generateDOCX";
import { Plus, FileText, FileDown, Trash2, User, Briefcase, MapPin, Calendar, Package, ChevronDown } from "lucide-react";
import { formatDate } from "./utils/formatDate";

const USERS = ["All Users", "Aryan Patel", "Nagji Chauhan"];

export default function Dashboard() {
  const { meetings, deleteMeeting } = useMeetings();
  const [selectedUser, setSelectedUser] = useState("All Users");

  const filteredMeetings = selectedUser === "All Users"
    ? meetings
    : meetings.filter((m) => m.participant === selectedUser);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mitoo" className="h-9 w-auto" />
            <div>
              <h1 className="text-[15px] font-bold text-[#111827] tracking-tight">mitoo</h1>
              <p className="text-[11px] text-[#9CA3AF] font-medium -mt-0.5">MOM Generator</p>
            </div>
          </div>
          <Link href="/new" className="btn-gradient text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-md">
            <Plus size={16} strokeWidth={2.5} />
            New Meeting
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {filteredMeetings.length === 0 && meetings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-5">
              <FileText size={28} className="text-[#4F46E5]" />
            </div>
            <h2 className="text-xl font-bold text-[#111827]">No meetings yet</h2>
            <p className="text-[#6B7280] mt-1.5 text-sm">Create your first meeting minutes to get started</p>
            <Link href="/new" className="inline-flex items-center gap-2 mt-6 btn-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md">
              <Plus size={16} strokeWidth={2.5} />
              Create MOM
            </Link>
          </div>
        ) : (
          <div>
            {/* Page Title + User Filter */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#111827] tracking-tight">All Meetings</h2>
                  <span className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-full">{filteredMeetings.length}</span>
                </div>
                <p className="text-[13px] text-[#6B7280] mt-1">Manage and generate meeting reports</p>
              </div>

              {/* User Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-10 text-[13px] font-medium text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/15 focus:border-[#4F46E5] cursor-pointer shadow-sm"
                >
                  {USERS.map((user) => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>

            {/* Meeting Cards */}
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#6B7280] text-sm">No meetings found for <span className="font-semibold">{selectedUser}</span></p>
              </div>
            ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => {
                const hasRemarks = meeting.remarks && meeting.remarks.length > 0;
                const statusText = hasRemarks && meeting.remarks.toLowerCase().includes("demo completed") ? "Demo Completed" : "Draft";
                const statusColor = statusText === "Demo Completed" ? "bg-emerald-500" : "bg-amber-400";

                return (
                  <div key={meeting.id} className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 card-elevated shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      {/* Left content */}
                      <div className="flex-1 min-w-0">
                        {/* Status + Company */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{statusText}</span>
                          <span className="text-[11px] text-[#D1D5DB]">•</span>
                          <span className="text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                            {meeting.participant}
                          </span>
                        </div>

                        <h3 className="text-[22px] font-bold text-[#111827] tracking-tight leading-tight mb-3">
                          {meeting.companyName || "Untitled Meeting"}
                        </h3>

                        {/* Details grid */}
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#6B7280]">
                          {meeting.meetingWith && (
                            <span className="flex items-center gap-1.5">
                              <User size={14} className="text-[#9CA3AF]" />
                              {meeting.meetingWith}
                            </span>
                          )}
                          {meeting.designation && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase size={14} className="text-[#9CA3AF]" />
                              {meeting.designation}
                            </span>
                          )}
                          {meeting.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#9CA3AF]" />
                              {meeting.location}
                            </span>
                          )}
                          {meeting.meetingDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-[#9CA3AF]" />
                              {formatDate(meeting.meetingDate)}
                            </span>
                          )}
                          {meeting.plan && (
                            <span className="flex items-center gap-1.5">
                              <Package size={14} className="text-[#9CA3AF]" />
                              {meeting.plan}
                            </span>
                          )}
                        </div>

                        {/* Remarks */}
                        {hasRemarks && (
                          <div className="mt-4 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3">
                            <p className="text-[13px] text-[#6B7280] leading-relaxed line-clamp-2">{meeting.remarks}</p>
                          </div>
                        )}
                      </div>

                      {/* Right action buttons */}
                      <div className="flex lg:flex-col items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => generatePDF(meeting)}
                          className="btn-scale w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center group"
                          title="Download PDF"
                        >
                          <FileText size={16} className="text-red-500 group-hover:text-red-600" />
                        </button>
                        <button
                          onClick={() => generateDOCX(meeting)}
                          className="btn-scale w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center group"
                          title="Download DOCX"
                        >
                          <FileDown size={16} className="text-blue-500 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this meeting?")) deleteMeeting(meeting.id); }}
                          className="btn-scale w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-gray-400 group-hover:text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
