"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useMeetings } from "../context/MeetingContext";
import { MeetingData, emptyMeeting } from "../types";
import { generatePDF } from "../utils/generatePDF";
import { generateDOCX } from "../utils/generateDOCX";
import Link from "next/link";
import { ArrowLeft, Save, FileText, FileDown, Sparkles } from "lucide-react";

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (val: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-[#374151] block mb-1.5 tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/15 focus:border-[#4F46E5] transition-all placeholder:text-[#D1D5DB]"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (val: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-[#374151] block mb-1.5 tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/15 focus:border-[#4F46E5] transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

export default function NewMeeting() {
  const router = useRouter();
  const { addMeeting } = useMeetings();
  const [form, setForm] = useState(emptyMeeting);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const meeting: MeetingData = {
      ...form,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    addMeeting(meeting);
    setSaved(true);
    return meeting;
  };

  const handleSaveAndPDF = async () => {
    const meeting = handleSave();
    await generatePDF(meeting);
  };

  const handleSaveAndDOCX = () => {
    const meeting = handleSave();
    generateDOCX(meeting);
  };

  const handleGenerateRemark = async () => {
    setAiLoading(true);
    setAiError("");
    update("remarks", "");

    try {
      const res = await fetch("/api/generate-remark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        setAiError(err.error || "Failed to generate remark.");
        setAiLoading(false);
        return;
      }

      // Stream the text chunk by chunk into the remarks field
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        update("remarks", accumulated);
      }
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">✅</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">MOM Saved Successfully!</h2>
          <p className="text-gray-500 mt-2">Your meeting minutes have been saved.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
              ← Dashboard
            </Link>
            <button onClick={() => { setForm(emptyMeeting); setSaved(false); }} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200">
              + New Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#9CA3AF] hover:text-[#4F46E5] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-[15px] font-bold text-[#111827] tracking-tight">New Meeting Minutes</h1>
          </div>
          <div className="flex gap-2.5">
            <button onClick={handleSaveAndPDF} className="btn-scale flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl text-[12px] font-semibold">
              <FileText size={14} />
              PDF
            </button>
            <button onClick={handleSaveAndDOCX} className="btn-scale flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl text-[12px] font-semibold">
              <FileDown size={14} />
              DOCX
            </button>
            <button onClick={handleSave} className="btn-gradient flex items-center gap-1.5 text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold shadow-md">
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-8 space-y-6">
        {/* Section 1: Meeting Details */}
        <section className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-5 flex items-center gap-2.5">
            <span className="w-7 h-7 bg-[#EEF2FF] text-[#4F46E5] rounded-lg flex items-center justify-center text-[11px] font-bold">1</span>
            Meeting Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Participant (from our side)" value={form.participant} onChange={(v) => update("participant", v)} options={["Aryan Patel", "Nagji Chauhan"]} />
            <InputField label="Meeting Date" value={form.meetingDate} onChange={(v) => update("meetingDate", v)} type="date" />
            <InputField label="Meeting Time" value={form.meetingTime} onChange={(v) => update("meetingTime", v)} type="time" />
          </div>
        </section>

        {/* Section 2: Customer Details */}
        <section className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-5 flex items-center gap-2.5">
            <span className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-[11px] font-bold">2</span>
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Company Name" value={form.companyName} onChange={(v) => update("companyName", v)} placeholder="e.g. GBPschool" />
            <InputField label="Meeting With" value={form.meetingWith} onChange={(v) => update("meetingWith", v)} placeholder="e.g. Ram Sharma" />
            <InputField label="Designation" value={form.designation} onChange={(v) => update("designation", v)} placeholder="e.g. Owner" />
            <InputField label="Industry" value={form.industry} onChange={(v) => update("industry", v)} placeholder="e.g. Service" />
            <InputField label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="e.g. Faridabad" />
            <InputField label="Total Employees" value={form.totalEmployees} onChange={(v) => update("totalEmployees", v)} placeholder="e.g. 3" />
            <InputField label="Currently Using" value={form.currentlyUsing} onChange={(v) => update("currentlyUsing", v)} placeholder="e.g. None" />
            <InputField label="Other Remarks" value={form.otherRemarks} onChange={(v) => update("otherRemarks", v)} placeholder="e.g. Interested in Essential plan" />
          </div>
        </section>

        {/* Section 3: Points Discussed */}
        <section className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-5 flex items-center gap-2.5">
            <span className="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-[11px] font-bold">3</span>
            Points Discussed
          </h2>
          <div className="mb-4">
            <InputField label="Plan" value={form.plan} onChange={(v) => update("plan", v)} placeholder="e.g. Mitoo Essential" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Lead Creation" value={form.leadCreation} onChange={(v) => update("leadCreation", v)} options={["Yes", "No"]} />
            <SelectField label="Lead Assignment" value={form.leadAssignment} onChange={(v) => update("leadAssignment", v)} options={["Yes", "No"]} />
            <SelectField label="Follow-up Management" value={form.followUpManagement} onChange={(v) => update("followUpManagement", v)} options={["Yes", "No"]} />
            <SelectField label="Customer Management" value={form.customerManagement} onChange={(v) => update("customerManagement", v)} options={["Yes", "No"]} />
            <SelectField label="Quotation Management" value={form.quotationManagement} onChange={(v) => update("quotationManagement", v)} options={["Yes", "No"]} />
            <SelectField label="Task & Reminder Management" value={form.taskReminderManagement} onChange={(v) => update("taskReminderManagement", v)} options={["Yes", "No"]} />
            <InputField label="Lead Sources" value={form.leadSources} onChange={(v) => update("leadSources", v)} placeholder="e.g. Walkin, Meta" />
            <SelectField label="Follow-up Process" value={form.followUpProcess} onChange={(v) => update("followUpProcess", v)} options={["Manual", "Automated", "Semi-Automated"]} />
            <SelectField label="WhatsApp/Email Integration" value={form.whatsappEmailIntegration} onChange={(v) => update("whatsappEmailIntegration", v)} options={["Yes", "No"]} />
            <SelectField label="Mobile App Requirements" value={form.mobileAppRequirements} onChange={(v) => update("mobileAppRequirements", v)} options={["Yes", "No"]} />
            <SelectField label="Reports & Dashboard" value={form.reportsDashboard} onChange={(v) => update("reportsDashboard", v)} options={["Yes", "No"]} />
            <SelectField label="Data Migrations" value={form.dataMigrations} onChange={(v) => update("dataMigrations", v)} options={["Yes", "No"]} />
            <SelectField label="Customization Requirements" value={form.customizationRequirements} onChange={(v) => update("customizationRequirements", v)} options={["Yes", "No"]} />
          </div>
        </section>

        {/* Section 4: Next Steps */}
        <section className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-5 flex items-center gap-2.5">
            <span className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-[11px] font-bold">4</span>
            Next Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Next Follow-up Date" value={form.nextFollowUpDate} onChange={(v) => update("nextFollowUpDate", v)} type="date" />
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-[#374151] tracking-wide">Remarks</label>
                <button
                  type="button"
                  onClick={handleGenerateRemark}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all
                    bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm
                    hover:from-violet-600 hover:to-indigo-600 hover:shadow-md
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                  title="Generate remark using AI based on the form data"
                >
                  <Sparkles size={12} className={aiLoading ? "animate-spin" : ""} />
                  {aiLoading ? "Generating…" : "AI Generate"}
                </button>
              </div>
              {aiError && (
                <p className="text-[11px] text-red-500 mb-1.5">{aiError}</p>
              )}
              <textarea
                value={form.remarks}
                onChange={(e) => update("remarks", e.target.value)}
                placeholder="e.g. Demo completed successfully. Client showed strong interest..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/15 focus:border-[#4F46E5] resize-none transition-all placeholder:text-[#D1D5DB]"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={handleSaveAndPDF} className="btn-scale flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-[13px] font-semibold shadow-md hover:bg-red-700 transition-colors">
            <FileText size={16} />
            Save & Download PDF
          </button>
          <button onClick={handleSaveAndDOCX} className="btn-gradient flex items-center gap-2 text-white px-6 py-3 rounded-xl text-[13px] font-semibold shadow-md">
            <FileDown size={16} />
            Save & Download DOCX
          </button>
        </div>
      </main>
    </div>
  );
}
