import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/server';

export async function GET(request: Request, { params }: { params: { team_id: string } }) {
  try {
    const { team_id } = params;
    const supabase = await createClient();

    // Fetch all events for the team
    const { data: events, error: eventsError } = await supabase
      .from('event')
      .select(
        `
        *,
        location:location_id (
          name,
          city,
          country
        )
      `
      )
      .eq('team_id', team_id)
      .order('start_time', { ascending: true });

    if (eventsError) throw eventsError;

    // If no events found, return empty arrays
    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          teamEvents: [],
          teamMatchDays: [],
        },
        { status: 200 }
      );
    }

    // Separate events into regular events and match days
    const teamEvents = [];
    const teamMatchDays = [];

    // Process each event to determine if it's a team event
    for (const event of events) {
      // Get participants for this event
      const { data: participants, error: participantsError } = await supabase
        .from('event_participant')
        .select('athlete_id')
        .eq('event_id', event.event_id);

      if (participantsError) throw participantsError;

      // If there are no participants, consider it a team event
      // This is based on the logic from the frontend where forTeam is true when participants array is empty
      const isTeamEvent = !participants || participants.length === 0;

      // Only include team events in the response
      if (isTeamEvent) {
        // Send the full timestamp to the client, which can format it according to its timezone
        const eventTimestamp = event.start_time;

        // Convert to the expected format
        const formattedEvent = {
          type: getEventTypeName(event.event_type_id),
          date: eventTimestamp, // Send the full timestamp instead of formatting it here
          title: event.title || undefined,
          location: event.location
            ? {
                name: event.location.name,
                city: event.location.city,
                country: event.location.country,
              }
            : undefined,
          eventId: event.event_id, // Include the event ID for reference
        };

        // Add to the appropriate array based on event type
        if (event.event_type_id === 1) {
          // Match event
          teamMatchDays.push(formattedEvent);
        } else {
          teamEvents.push(formattedEvent);
        }
      }
    }

    return NextResponse.json(
      {
        teamEvents: teamEvents,
        teamMatchDays: teamMatchDays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching team events:', error);
    return NextResponse.json({ error: 'Failed to fetch team events' }, { status: 500 });
  }
}

// Helper function to convert event_type_id to a friendly name
function getEventTypeName(eventTypeId: number): string {
  const eventTypes = {
    1: 'Match Day',
    2: 'Travel',
    3: 'Hotel',
    4: 'Rest Day',
    5: 'Recovery',
    6: 'Training',
  };

  // Use modulo 6 to handle extended event types and ensure we always get a valid type
  const normalizedTypeId = ((eventTypeId - 1) % 6) + 1;
  return eventTypes[normalizedTypeId as keyof typeof eventTypes];
}
