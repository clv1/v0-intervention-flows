const getAthleteOnlyEvents = async (athleteId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const eventResponse = await fetch(`${baseUrl}/api/event/athlete/${athleteId}`, {
    cache: 'no-store',
  });
  const eventData = await eventResponse.json();
  return eventData;
};

const getAthleteTeamEvents = async (teamId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const eventResponse = await fetch(`${baseUrl}/api/event/team/${teamId}`, {
    cache: 'no-store',
  });
  const eventData = await eventResponse.json();
  return eventData;
};

const getAthleteEvents = async (athleteId: string, teamId: string) => {
  const athleteOnlyEvents = await getAthleteOnlyEvents(athleteId);
  const athleteTeamEvents = await getAthleteTeamEvents(teamId);

  // Combine the events into a unified structure
  return {
    athleteEvents: [...(athleteOnlyEvents.athleteEvents || []), ...(athleteTeamEvents.teamEvents || [])],
    athleteMatchDays: [...(athleteOnlyEvents.athleteMatchDays || []), ...(athleteTeamEvents.teamMatchDays || [])],
  };
};

export default getAthleteEvents;
