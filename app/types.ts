export interface MeetingData {
  id: string;
  createdAt: string;

  // Meeting Details
  participant: string;
  meetingTime: string;
  meetingDate: string;

  // Customer Details
  companyName: string;
  meetingWith: string;
  designation: string;
  industry: string;
  location: string;
  totalEmployees: string;
  currentlyUsing: string;
  otherRemarks: string;

  // Plan Discussion
  plan: string;
  leadCreation: string;
  leadAssignment: string;
  followUpManagement: string;
  customerManagement: string;
  quotationManagement: string;
  taskReminderManagement: string;
  leadSources: string;
  followUpProcess: string;
  whatsappEmailIntegration: string;
  mobileAppRequirements: string;
  reportsDashboard: string;
  dataMigrations: string;
  customizationRequirements: string;

  // Next Steps
  nextFollowUpDate: string;
  remarks: string;
}

export const emptyMeeting: Omit<MeetingData, "id" | "createdAt"> = {
  participant: "Aryan Patel",
  meetingTime: "",
  meetingDate: new Date().toISOString().split("T")[0],
  companyName: "",
  meetingWith: "",
  designation: "",
  industry: "",
  location: "",
  totalEmployees: "",
  currentlyUsing: "",
  otherRemarks: "",
  plan: "Mitoo Essential",
  leadCreation: "Yes",
  leadAssignment: "Yes",
  followUpManagement: "Yes",
  customerManagement: "Yes",
  quotationManagement: "No",
  taskReminderManagement: "No",
  leadSources: "",
  followUpProcess: "Manual",
  whatsappEmailIntegration: "No",
  mobileAppRequirements: "Yes",
  reportsDashboard: "Yes",
  dataMigrations: "No",
  customizationRequirements: "No",
  nextFollowUpDate: "",
  remarks: "",
};
