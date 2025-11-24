RoleModel AI Lead Qualification Tool
Objective
To increase the number of qualified leads and booked consultations for RoleModel Software by implementing a hybrid AI-driven qualification tool on a dedicated landing page or subdomain.

Rationale
Our current consultation-driven sales process is highly effective, but website visitors often hesitate to schedule a call because they are unsure if custom software is a good fit for their business. The proposed tool addresses this gap by:

Pre-qualifying prospects using structured BANT (Budget, Authority, Need, Timeline) questions and business goal context.

Providing subtle AI-generated insights, clarifying guidance, and curated content links, demonstrating thought leadership and our expertise with AI.

Delivering a concise, structured summary to both the prospect and our sales team, enhancing the efficiency and relevance of initial conversations.

Alignment with 2026 Marketing Strategy:
This tool directly supports our strategy of running experimentation-driven marketing initiatives to:

1. Reduce friction for new prospects in exploring custom software.
2. Capture qualified leads efficiently while providing a high-value, consultative experience.
3. Showcase RoleModel’s innovative use of AI in a controlled, low-risk format.
4. Generate measurable insights on visitor engagement, drop-off points, and lead quality for future iterations of our marketing and sales approach.

Strategic Advantages

1. Balances AI innovation with structured qualification, minimizing risk and maintaining predictability.
2. Short, self-paced experience (~3–5 minutes) designed for high completion rates.
3. Supports ongoing content promotion (blog posts, ROI guides, case studies) to educate and nurture prospects.
4. Integrates directly with CRM and Calendly for seamless follow-up and call scheduling.

---

Draft Plan

1. Objectives
   Primary goal: Increase the number of booked calls with your sales team.
   Secondary goals: Pre-qualify leads by Budget, Need, Authority, and Timeline (BANT); provide a structured summary of the conversation for sales; subtly educate prospects via content links.
2. Core Functionality
   - Conversation type: Hybrid — structured qualifying questions with AI-led follow-ups for clarity.
   - Flow length: Short, 3–5 minutes, self-paced.
   - Contact info: Gathered early, ideally before providing the qualification summary.
   - Output:
   - Structured summary (BANT + business goal context).
   - Suggested next steps for qualified or “not-yet-ready” prospects.
   - Option to email summary to prospect.
   - Content integration: AI references RoleModel blog posts, ROI guides, case studies, and philosophy.
   - Resources: Automatically suggest relevant content in-line, non-intrusively.
   - Tone: Professional, consultative, gentle but clear for disqualifications[a].
   - Fallbacks: Conservative; if AI cannot answer, suggest rephrasing or scheduling a call.
   - High personalization: Uses prospect’s name, industry context, and prior answers.

3. UX / Design
   - Minimal design aligned with RoleModel branding (Optics Design System).[b]
   - Simple progress indicator (percentage-based).
   - Text-based interaction with links to external media.
   - Introductory message framing the purpose.
   - Feedback mechanism for user experience?
   - Desktop-first (mobile-friendly if feasible).[c][d]
4. Technology & Architecture
   - Custom AI frontend leveraging cloud or self-hosted open-source models.
   - Real-time CRM/webhook integration for: contact info, UTM tracking, and structured summaries.
   - No session persistence (each session starts fresh).[e][f]
   - No multi-language support (English-only).
   - Single pathway conversation with conditional follow-ups.
   - Scalable to handle multiple concurrent users.

5. Risk Mitigation
   - AI recommending external solutions: AI trained to focus on RoleModel’s expertise; gentle guidance to off-the-shelf solutions if necessary.
   - Privacy concerns: Early contact info collection, plus disclaimers on privacy and ROI accuracy.
   - Misinterpretation of answers: Multiple follow-up questions to clarify vague responses.
   - Brand perception: Professional, consultative tone; content references reinforce credibility.
   - Technical failures: Standard error messaging; CRM timestamps and logging handle tracking.
6. Lead Nurturing & Follow-up
   AI provides content recommendations automatically.
   Follow-up handled externally via existing marketing/sales processes.
7. Analytics
   - Track: number of visitors starting AI, drop-off points, conversion to calls.
   - Persist UTM parameters and tracking info through the session to CRM.
   - Trend analysis for conversation refinement is a future enhancement.

8. MVP Scope
   - Text-based, single pathway, short self-paced sessions.
   - Structured summary emailed to prospect and sent to CRM.
   - High personalization using prospect inputs.
   - Automatic content suggestions, but no interactive visuals or file uploads.
   - Conservative fallback for misunderstood inputs.

9. Potential Enhancements (Future)
   File uploads for deeper workflow context.
   Session persistence.
   Trend analytics for refining questions and AI logic.
   Interactive visual elements (charts, sliders, checklists).
   Multi-step or gamified experiences.

10. Implementation Roadmap
    Phase 1 — Planning & Design (1–2 weeks)
    Define exact qualifying questions and follow-up logic.
    Map conversation flow (primary pathway + clarifying prompts).
    Define content references and resource links.
    UX design using Optics.[g][h][i]

Phase 2 — Development (2–3 weeks)
Build custom frontend (chat interface).
Integrate AI model with structured conversation logic.
Implement CRM/webhook integration, UTM tracking.
Include email summary functionality.

Phase 3 — Testing & Refinement (1 week)
Internal testing with sample conversations.
Adjust follow-up prompts, personalization, and content references.
Ensure fallback behavior works as intended.

Phase 4 — Launch & Monitoring (Ongoing)
Deploy on dedicated landing page/subdomain.
Monitor drop-off rates and engagement.
Gather user feedback to iterate on improvements.

---

Alternative Approach: Structured Qualification + AI Highlights

1. Core Concept
   - Main qualification is done through a structured form or interactive quiz (short, 5–7 questions, 3–5 minutes).
   - AI is layered in to provide dynamic insights, contextual hints, or content recommendations, without running the full conversation.
   - Users feel they’re interacting with AI, but you retain control, predictability, and structured analytics.
2. Flow
   1. Landing Page / Subdomain
   1. Clear intro framing: “This tool helps you see if custom software makes sense for your business.”
   1. Explain estimated time to complete (3–5 minutes).
   1. Highlight that AI guidance and curated resources are provided.
   1. Initial Contact Capture
   1. Minimal gate: Name + Email (ensures lead capture early).
   1. Could use soft wording: “We’ll email you a summary of your results plus helpful insights.”
   1. Structured Qualification Form
   1. Core BANT + business goal questions: Budget, Authority, Need, Timeline, desired outcomes.
   1. Predefined multiple-choice or short free-text inputs.
   1. AI Highlights / Contextualization
   1. AI reviews the user’s responses behind the scenes.
   1. Generates dynamic recommendations, clarifying hints, or links to relevant content:
   1. Suggests relevant ROI guides or case studies.
   1. Provides contextual examples if the user’s answer is vague.
   1. Optional: subtle “next step” messaging: “Based on your inputs, a custom solution could accelerate X—here’s how RoleModel has helped others.”
   1. Qualification Summary
   1. Structured output: BANT + business goal context + AI insights.
   1. Offer email summary to prospect and webhook submission to CRM.
   1. Call-to-Action
   1. Clearly recommend scheduling a call via Calendly.
   1. AI can highlight the value: “We can explore how your business can achieve similar ROI through a personalized consultation.”

3. Benefits of Hybrid Approach
   - Lead Capture: Contact info collected early.
   - Predictability: Form ensures accurate, structured qualification data.
   - AI Credibility: Dynamic AI highlights demonstrate thought leadership and innovation.
   - Content Integration: AI can point to blog posts, ROI guides, or case studies without overcomplicating the flow.
   - Low Risk: AI isn’t responsible for the entire conversation — reduces misqualification, friction, and privacy concerns.
   - Analytics Ready: Form responses + AI insights can feed CRM and allow clear tracking.
   - Quick MVP: Easier and faster to implement than full AI chat.

4. Optional Enhancements
   - AI-Powered Clarifying Questions: Triggered only if user’s free-text answer is vague.
   - Dynamic Recommendations: Suggest different content/resources depending on answers.
   - Future AI Upgrade: Eventually evolve the tool into a conversational AI chat without rewriting the qualification logic.

---

System Prompt

You are the AI assistant inside RoleModel Software’s lead qualification tool.
Your purpose is to help potential clients determine whether exploring custom software with RoleModel is the right next step for them.

Your responsibilities:

1. Ask targeted questions to pre-qualify the prospect using BANT:
   - Budget
   - Authority
   - Need (primary business problem or goal)
   - Timeline
2. Ask ONE question at a time. Do not show future questions.
3. Complete qualification within 5 total questions.
4. If an answer is unclear, ask a single clarifying question.
5. Maintain a professional, consultative, and encouraging tone.
6. When appropriate, offer brief educational insights about custom software ROI,
   cross-platform integration, or RoleModel’s approach.
7. Suggest relevant RoleModel content only when it supports the conversation,
   and limit suggestions to one resource at a time.
   (e.g., ROI guide, case studies, blog posts)
8. Avoid recommending competitors or non–RoleModel solutions.
9. If the user appears disqualified (e.g., no meaningful need, extremely low budget,
   no authority and no path to authority), be gentle but clear.
10. If you cannot answer a question, ask the user to rephrase OR suggest scheduling
    a conversation with RoleModel for more clarity.

Output Requirements:

- Ask questions one at a time.
- Keep responses concise (2–4 sentences max).
- When the final question is answered, produce a structured summary for the client that outlines their potential opportunity and is foundation for the sales team. Also ask them to schedule a call if they’d like to discuss further.

First question

Give me a bit of context on your business.

First question

Ask the user to describe the primary business problem they want to solve or the opportunity they hope to unlock with custom software.

Goals:

- Understand their business workflow challenge, inefficiency, scaling constraint, or competitive advantage need.
- Common examples are that current off-the-shelf software doesn’t fit needs or is overwhelmed by spreadsheets
- If unclear, ask a SINGLE clarifying question.
- Optionally reference RoleModel’s ROI article, https://rolemodelsoftware.com/blog/how-to-consider-roi, or a case study if it fits naturally.
- Keep the question simple and avoid jargon.

What have you tried so far?

After receiving their answer, store the result and move to the next BANT question.
[a]@caleb.woods@rolemodelsoftware.com How do we build in guardrails to protect against the AI improperly disqualifying a business? We should think through this use case and how we can design safeties into the system or at least reporting the why, and when in the process the AI recommended disqualification. We may also not want auto disqualification and instead allow the AI to report to us it's findings and have us review findings before A.) Reaching out to them to schedule a call or B.) sending the disqualification (or you don't seem to be a fit) message to the potential partner.
_Assigned to caleb.woods@rolemodelsoftware.com_
[b]@caleb.woods@rolemodelsoftware.com I can see the desire to ship this fast. I would push back on this being minimal long term. I think the combination of a highly branded experience will add additional value and brand credibility to the service.
_Assigned to caleb.woods@rolemodelsoftware.com_
[c]@caleb.woods@rolemodelsoftware.com I would argue that making this mobile friendly should be a MVP target for this. We should meet them where they are for a service like this and I don't see that being a huge lift for this type of offering.
_Assigned to caleb.woods@rolemodelsoftware.com_
[d]I don't think mobile friendly is hard here. Our traffic and especially decision-making traffic is 80%+ Desktop, so just noting where we can prioritize
[e]@caleb.woods@rolemodelsoftware.com Is session persistence something we could consider in the future?
_Assigned to caleb.woods@rolemodelsoftware.com_
[f]Yeah, in the roadmap. Just calling out as something we wouldn't have to have
[g]@caleb.woods@rolemodelsoftware.com It's possible the this could be built with vibe coding itself while using Framer as the backbone for this. But if we want this to be a custom coded project I get it.
_Assigned to caleb.woods@rolemodelsoftware.com_
[h]The final tech stack is still TBD. Also considering how Next.js and Vercel's AI SDK https://ai-sdk.dev/ which Dallas/Ben have used on Mediant might be a good fit
[i]That stack would be interesting.
