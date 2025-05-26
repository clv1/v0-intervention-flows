import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athleteData, teamData } = body;

    if (!athleteData) {
      return NextResponse.json(
        { error: 'Missing athlete data' },
        { status: 400 }
      );
    }

    if (!teamData) {
      return NextResponse.json(
        { error: 'Missing team average data' },
        { status: 400 }
      );
    }

    // Ensure the data is in string format
    const athleteDataString =
      typeof athleteData === 'string'
        ? athleteData
        : JSON.stringify(athleteData, null, 2);
    const teamDataString =
      typeof teamData === 'string'
        ? teamData
        : JSON.stringify(teamData, null, 2);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            "Imagine that you're a sports scientist assistant helping the Head of Performance to get a quick overview on the team's recovery and strain status for the given period.",
        },
        {
          role: 'user',
          content: `
              Context:
              Summarize the team's recovery and strain data, emphasizing significant changes (+/- 10%) at both individual and team levels compared to the previous period.

              Rules:
              ✅ Comparison Guidelines:

              If the selected period is today, compare it to yesterday and the all-time average.
              For multi-day periods, compare with the previous period of the same length (e.g., March 5-11 vs. Feb 26-March 4).
              Use absolute differences for recovery scores (e.g., if recovery score is 65 today and yesterday was 70 "Recovery dropped by 5%"), and avoid decimals.
              Do not compare periods of different lengths (e.g., March 11 vs. March 5-11).
              ✅ Content Prioritization:

              Identify the biggest individual differences first, then team-level trends. Focus only on negative trends.
              Summarize only the most important insights (max 500 characters).
              Do not list every metric—focus on key takeaways.
              Always use integers
              Strain is always in values on a scale from 0 to 21. Recovery score is always a %
              For recovery scores instead of giving a percentage difference give an absolute difference (in %) - e.g. if today's score is 67% and yesterday was 62% - that's a 5% difference
              Present the summary in bullet points (•) for clarity.
    
              Only mention this week, this month, etc. only if the score is the best for the given period
              ✅ Formatting:

              Use date ranges (e.g., "5-11 March") for period comparisons.
              If referring to a single day, use the exact date (e.g., "10 March").
              If comparing across years, include the year (e.g., "13 Feb 2024").
              Examples of Ideal Output:
              • Kevin Chirayil's recovery dropped by 21% today vs. yesterday. Check the performance page for potential issues.
              • Team recovery fell by 6% compared to last week average, while strain remained steady. This could indicate insufficient recovery protocols.
              • Despite a 25% strain increase, recovery only dropped by 5%, suggesting good adaptation to load.

              Structure:
               1️⃣ Individual Alert (if applicable)
               2️⃣ Team-Level Alerts (if applicable)
               3️⃣ Team Summary on Recovery & Strain
               Don't include the 1,2,3 points or the name of the group. This is just a explaination of how to group them and order them

              The data for each of the athletes is:
              ${athleteDataString}

              The average data for the team is:
              ${teamDataString}
              `,
        },
      ],
      max_tokens: 400,
    });

    return NextResponse.json({
      analysis: response.choices[0].message.content,
    });
  } catch (error: unknown) {
    console.error(
      'OpenAI API error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: 'Failed to analyze data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
