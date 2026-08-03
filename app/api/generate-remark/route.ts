import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local file." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await request.json();

  const prompt = `You are a CRM sales assistant for Mitoo, a CRM software company.
Based on the following meeting details, write a concise, professional "Remarks" summary (2–4 sentences) for the Minutes of Meeting document.
Focus on: what was discussed, client's interest level, key features they need, and any notable observations.
Do NOT include a heading or label — just the remark text itself.

Meeting Details:
- Participant (Mitoo side): ${data.participant}
- Date: ${data.meetingDate}, Time: ${data.meetingTime}
- Company: ${data.companyName}
- Meeting With: ${data.meetingWith} (${data.designation})
- Industry: ${data.industry}
- Location: ${data.location}
- Total Employees: ${data.totalEmployees}
- Currently Using: ${data.currentlyUsing}
- Plan Discussed: ${data.plan}
- Lead Creation: ${data.leadCreation}
- Lead Assignment: ${data.leadAssignment}
- Follow-up Management: ${data.followUpManagement}
- Customer Management: ${data.customerManagement}
- Quotation Management: ${data.quotationManagement}
- Task & Reminder Management: ${data.taskReminderManagement}
- Lead Sources: ${data.leadSources}
- Follow-up Process: ${data.followUpProcess}
- WhatsApp/Email Integration: ${data.whatsappEmailIntegration}
- Mobile App Requirements: ${data.mobileAppRequirements}
- Reports & Dashboard: ${data.reportsDashboard}
- Data Migrations: ${data.dataMigrations}
- Customization Requirements: ${data.customizationRequirements}
- Next Follow-up Date: ${data.nextFollowUpDate}
- Other Remarks from rep: ${data.otherRemarks}

Write the remarks now:`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!openaiResponse.ok) {
    const err = await openaiResponse.text();
    return new Response(
      JSON.stringify({ error: `OpenAI error: ${openaiResponse.status} — ${err}` }),
      { status: openaiResponse.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream OpenAI SSE chunks directly to the client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = openaiResponse.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.trim().startsWith("data:"));

          for (const line of lines) {
            const json = line.replace(/^data:\s*/, "");
            if (json === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(json);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
