import { NextResponse } from "next/server";

export async function GET() {
  // Generate available 30-min slots for the next 2 weeks
  // Exclude weekends and before 9am / after 5pm PST
  const slots: string[] = [];
  const now = new Date();

  for (let d = 1; d <= 14; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);

    // Skip weekends
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    // Generate 30-min slots from 9am to 4:30pm PST
    for (let hour = 9; hour < 17; hour++) {
      for (const min of [0, 30]) {
        if (hour === 16 && min === 30) continue; // Skip 4:30pm (last slot is 4:00-4:30)
        const slot = new Date(date);
        slot.setHours(hour, min, 0, 0);
        // Only include future slots
        if (slot > now) {
          slots.push(slot.toISOString());
        }
      }
    }
  }

  return NextResponse.json({ slots });
}
