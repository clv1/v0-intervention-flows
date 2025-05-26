import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/server';

export async function GET(request: Request, { params }: { params: { athlete_id: string } }) {
  try {
    const { athlete_id } = params;
    const supabase = await createClient();

    // Get all events where the athlete is a participant
    const { data: participantEvents, error: participantError } = await supabase
      .from('event_participant')
      .select('event_id')
      .eq('athlete_id', athlete_id);

    if (participantError) throw participantError;

    // If no events found, return empty arrays
    if (!participantEvents || participantEvents.length === 0) {
      return NextResponse.json(
        {
          athleteEvents: [],
          athleteMatchDays: [],
        },
        { status: 200 }
      );
    }

    // Get the list of event IDs
    const eventIds = participantEvents.map((pe) => pe.event_id);

    // Fetch the base events
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
      .in('event_id', eventIds)
      .order('start_time', { ascending: true });

    if (eventsError) throw eventsError;

    // Separate events into regular events and match days
    const athleteEvents = [];
    const athleteMatchDays = [];

    // Process each event
    for (const event of events) {
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
        athleteMatchDays.push(formattedEvent);
      } else {
        athleteEvents.push(formattedEvent);
      }
    }

    return NextResponse.json(
      {
        athleteEvents: athleteEvents,
        athleteMatchDays: athleteMatchDays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching athlete events:', error);
    return NextResponse.json({ error: 'Failed to fetch athlete events' }, { status: 500 });
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
