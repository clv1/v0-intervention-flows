'use client';

import { useEffect, useState } from 'react';

/**
 * Formats object data into a readable string format for the AI prompt
 */
const formatDataForPrompt = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => {
      // Format the value based on its type
      const formattedValue = typeof value === 'number'
        ? value.toFixed(2)
        : String(value);

      return `${key}: ${formattedValue}`;
    })
    .join('\n');
};

export default function AIAnalysisHomepage({
  athletesPromptData,
  teamData,
}: {
  athletesPromptData: Record<string, string>
  teamData: Record<string, number | null>
}) {
  const [analysis, setAnalysis] = useState<string>('Loading analysis...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        // Convert the data objects to formatted strings
        const athleteDataString = formatDataForPrompt(athletesPromptData);
        const teamDataString = formatDataForPrompt(teamData);

        // Check if data is empty but don't update the analysis state with error messages
        if (!athleteDataString || athleteDataString.trim() === '' ||
          !teamDataString || teamDataString.trim() === '') {
          // console.error('Missing data for analysis', {
          //   hasAthleteData: !!athleteDataString,
          //   hasTeamData: !!teamDataString,
          //   athleteDataLength: athleteDataString?.length,
          //   teamDataLength: teamDataString?.length
          // });
          return; // Keep showing "Loading analysis..."
        }

        const requestBody = {
          athleteData: athleteDataString,
          teamData: teamDataString,
        };

        // Log the request data for debugging
        console.debug('Request data:', requestBody);

        const response = await fetch('/api/openAIHomepage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        // Try to parse the JSON response
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          return; // Keep showing "Loading analysis..."
        }

        if (data.error) {
          console.error('API returned an error:', data.error);
          return; // Keep showing "Loading analysis..."
        }

        // Only update the analysis if we have valid data
        if (data.analysis) {
          setAnalysis(data.analysis);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AI Analysis error:', error);
        // Don't update the analysis state with error message
      }
    };

    fetchAnalysis();
  }, [athletesPromptData, teamData]);

  return (
    <div className="text-white w-100">
      {analysis.split('\n').map((line: string, index: number) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
} 