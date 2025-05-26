import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metrics, selectedPeriod, periodLengthInDays, previousPeriod } =
      body;

    if (!metrics) {
      return NextResponse.json(
        { error: 'Missing metrics data' },
        { status: 400 }
      );
    }
    if (!selectedPeriod) {
      return NextResponse.json(
        { error: 'Missing selected period data' },
        { status: 400 }
      );
    }
    if (!periodLengthInDays) {
      return NextResponse.json(
        { error: 'Missing period length in days data' },
        { status: 400 }
      );
    }
    if (!previousPeriod) {
      return NextResponse.json(
        { error: 'Missing previous period data' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are a sports scientist or Head of Physical Performance who wants to get quick glance of the player’s condition for the given period. You want something but informative that could be passed to Head coach or manager.',
        },
        {
          role: 'user',
          content: `
            Here is an athlete's performance data over the last selected period:

            Current Period (${periodLengthInDays} days): ${selectedPeriod.start} - ${selectedPeriod.end}            
            Previous Period (${periodLengthInDays} days): ${previousPeriod.start} - ${previousPeriod.end} 

            The metrics are as follows:
            Recovery: ${metrics.recoveryAverage} (Previous: ${metrics.previousRecoveryAverages}, All-time: ${metrics.allTimeRecoveryAverage})
            Strain: ${metrics.workloadAverage} (Previous: ${metrics.previousWorkloadAverages}, All-time: ${metrics.allTimeWorkloadAverage})
            RHR: ${metrics.rhrAverage} (Previous: ${metrics.previousRHRAverages}, All-time: ${metrics.allTimeRHRAverage})
            HRV: ${metrics.hrvAverage} (Previous: ${metrics.previousHRVAverages}, All-time: ${metrics.allTimeHRVAverage})
            Sleep Performance: ${metrics.sleepPerformanceAverage} (Previous: ${metrics.previousSleepPerformanceAverages}, All-time: ${metrics.allTimeSleepPerformanceAverage})
            Sleep Consistency: ${metrics.sleepConsistencyAverage} (Previous: ${metrics.previousSleepConsistencyAverages}, All-time: ${metrics.allTimeSleepConsistencyAverage})
            Sleep Efficiency: ${metrics.sleepEfficiencyAverage} (Previous: ${metrics.previousSleepEfficiencyAverages}, All-time: ${metrics.allTimeSleepEfficiencyAverage})
            Sleep Duration: ${metrics.sleepDurationAverage} (Previous: ${metrics.previousSleepDurationAverages}, All-time: ${metrics.allTimeSleepDurationAverage})
            Restorative Sleep Duration: ${metrics.restorativeSleepDurationAverage} (Previous: ${metrics.previousRestorativeSleepDurationAverages}, All-time: ${metrics.allTimeRestorativeSleepDurationAverage})
            Restorative Sleep: ${metrics.restorativeSleepAverage} (Previous: ${metrics.previousRestorativeSleepAverages}, All-time: ${metrics.allTimeRestorativeSleepAverage})

            For example:
            Recovery: 25 (Previous: 32, All-time: 60) means that the average recovery metric for the current period is 25, the previous period is 32, and the all-time average is 60.

            Examples of ideal analysis:
            - Example 1: HRV has steadily declined over the past 7 days, with values 15% below the all-time average, indicating potential recovery issues.
            - Example 2: Sleep efficiency has improved by 10% compared to the previous period, suggesting successful adjustments in sleep hygiene.
            - Example 3: Recovery score has decreased with less than 10% even though the strain is up by 25% and sleep performance has remained consistent. This represents somewhat sufficient application of recovery protocols and okay-level of adaptability to the strain demands.
            - Example 4: RHR has decreased with 10% in this period comparing it to [the previous period.start date]-[the previous period.end date]

            Please provide a short summary:
            - Compare the current period with the previous same-length period. Don't call it "previous days" Use the date ranges of the period. Use the following format for a date: e.g. 13 Feb, 15 Feb, etc. If it's not in the current year include the year too - e.g. 13 Feb 2024. If you compare it to the other period you can say "previous [number of days of the period]". Current period is in dates. When comparing/describing two time periods, use the current period's start and end date, but for the previous period use the duration 
            - Highlight significant trends (improvements or declines).
            - Mention how the values in this period compare to the all-time average.
            - Identify potential risks or areas of opportunity.

            Rules:

            - Please use maximum of 500 characters and do not provide summary for each metric. 
            - Rather, pick the most significant trends and changes that you notice.
            - Given the short-length requirement feel free to pick the most important information to describe.
            - Round numbers to integers always - no decimals are needed
            - Separate the summary in bullet points (•)
            `,
        },
      ],
      max_tokens: 200,
    });

    return NextResponse.json({ analysis: response.choices[0].message.content });
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
