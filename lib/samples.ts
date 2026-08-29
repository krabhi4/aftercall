import type { Stage } from './schema'

export type Sample = { id: string; label: string; currentStage: Stage; transcript: string }

export const SAMPLES: Sample[] = [
  {
    id: 'hot-demo',
    label: 'Hot lead · post-demo close',
    currentStage: 'Demo Scheduled',
    transcript: `Rep: Hi Priya, thanks for making time again. Last week we walked through the workflow builder. You wanted to show it to your ops team, how did that land?
Prospect: Honestly, better than I expected. The ops team ran the invoice-matching flow on real data on Thursday and it caught two mismatches our current tool missed.
Rep: That's great to hear. Was Rahul from finance in that session?
Prospect: He was. His only concern is the audit log, he needs every automated action attributable for our SOC 2 renewal in March.
Rep: The audit trail is per-action with actor, timestamp, and input hash. I'll send the compliance one-pager today.
Prospect: Perfect. Send it to priya.sharma@meridianlogistics.com. If that checks out we want to start with the finance pod, about 25 seats.
Rep: We can do 25 seats on the Growth plan at $18 a seat monthly, billed annually. I'll include a draft order form with the one-pager.
Prospect: Do that. One ask, our CFO signs anything above 5k annually, so give me a two-week window for signature.
Rep: Understood. I'll send the proposal and the compliance doc today, and follow up next Tuesday. Anything else blocking?
Prospect: No, this is the one we want. My number is 98201-44321 if procurement needs to reach me directly.
Rep: Noted. Talk Tuesday, Priya.`,
  },
  {
    id: 'warm-discovery',
    label: 'Warm lead · first discovery',
    currentStage: 'New Lead',
    transcript: `Rep: Hi Marcus, this is Dana from Relay. You filled out the form on our pricing page yesterday, do you have ten minutes?
Prospect: Sure, but I'll be honest, I'm early. We're a 40-person agency and our client onboarding is all spreadsheets and email right now.
Rep: What does that cost you today, roughly?
Prospect: Every new client takes about two weeks to onboard and at least one thing falls through the cracks each time. Last month we missed a contract renewal date, that was embarrassing.
Rep: So repeatable checklists with deadlines and client-visible status would matter. Who besides you would use it?
Prospect: Our three account leads, maybe the PM team later. I should say, we looked at Monday and it felt like too much.
Rep: Fair. Relay is narrower, onboarding pipelines only. What's your timeline?
Prospect: No hard deadline. Q3 budget review is in about six weeks, if I bring anything to the partners it'd be then.
Rep: Would a 20-minute walkthrough with your account leads before the review help you make that case?
Prospect: Maybe. Send me something I can forward first, I'm marcus@fieldnote.agency. If the leads like what they see we'll book the walkthrough.
Rep: Will do, I'll send a two-minute demo video and case study today. I'll check back in a week.
Prospect: Sounds fine. No promises, but the renewal miss got the partners' attention, so the timing isn't bad.`,
  },
  {
    id: 'lost-budget',
    label: 'Cold call · bad fit',
    currentStage: 'Qualified',
    transcript: `Rep: Hi Tom, following up on the proposal we sent two weeks ago for the 50-seat rollout. Did the team get a chance to review?
Prospect: Yeah, look, I'll save you the chase. The board froze all new software spend on Friday. Everything non-essential is pushed to next fiscal year.
Rep: Sorry to hear that. Is the freeze across the whole org or just your division?
Prospect: Company-wide. We had three tools in procurement and all of them are parked, it's not about your product.
Rep: Understood. When does your next fiscal year start?
Prospect: April. But honestly, even then, the new COO wants to consolidate vendors, not add them. I'd put us at a maybe at best.
Rep: Would it be useful if I checked back in March with updated pricing, or would you rather reach out if things change?
Prospect: Don't waste your cycles on us monthly. March is fine, one email. If the freeze lifts I know where to find you.
Rep: Fair enough, I'll close this out on our side and drop you one line in March. Appreciate the straight answer, Tom.
Prospect: No problem. For what it's worth the eval team liked the product, it's purely a money thing.`,
  },
]
