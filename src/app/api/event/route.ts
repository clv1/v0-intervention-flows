import { NextResponse } from 'next/server';
import { createClient } from '../../lib/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Handle location creation/lookup
    let location_id = null;

    if (body.location) {
      const { venue, name, city, country } = body.location;
      // Use venue if available, otherwise fall back to name, or empty string
      const locationName = venue || name || '';

      // Check if location exists
      const { data: existingLocation } = await supabase
        .from('location')
        .select('location_id')
        .eq('name', locationName)
        .eq('city', city)
        .eq('country', country)
        .single();

      if (existingLocation) {
        location_id = existingLocation.location_id;
      } else {
        // Create new location
        const { data: newLocation, error: locationError } = await supabase
          .from('location')
          .insert({
            name: locationName,
            city,
            country,
          })
          .select('location_id')
          .single();

        if (locationError) throw locationError;
        location_id = newLocation.location_id;
      }
    }

    // Start a transaction by inserting into the base event table
    const { data: event, error: eventError } = await supabase
      .from('event')
      .insert({
        team_id: body.team_id,
        event_type_id: body.event_type_id,
        start_time: body.start_time,
        end_time: body.end_time,
        location_id: location_id,
        notes: body.notes,
        title: body.title,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Handle event-specific data based on event type
    switch (body.event_type_id) {
      case 1: // Match
        const { error: matchError } = await supabase
          .from('match_event')
          .insert({
            event_id: event.event_id,
            opponent: body.opponent,
            gps_data: body.gps_data,
          });
        if (matchError) throw matchError;
        break;

      case 2: // Travel
        // DEBUGGING: Log the entire body for travel event
        console.log('DEBUG - Full travel event body:', JSON.stringify(body));

        // Handle from_location if it's an object instead of an ID
        let from_location_id = body.from_location_id;
        console.log('DEBUG - from_location_id type:', typeof from_location_id);
        console.log('DEBUG - from_location_id value:', from_location_id);

        // DEBUGGING: Check if from_location_id is a problematic value
        if (from_location_id && typeof from_location_id === 'object') {
          console.log(
            'DEBUG - from_location_id is an object, not a primitive:',
            from_location_id
          );
          // Convert object to ID
          const fromLocationObj = from_location_id;
          const { venue, name, city, country } = fromLocationObj;
          const locationName = venue || name || '';

          // Check if location exists
          const { data: existingFromLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingFromLocation) {
            from_location_id = existingFromLocation.location_id;
            console.log(
              'DEBUG - Found existing location from object:',
              from_location_id
            );
          } else {
            // Create new location
            const { data: newFromLocation, error: locationError } =
              await supabase
                .from('location')
                .insert({
                  name: locationName,
                  city,
                  country,
                })
                .select('location_id')
                .single();

            if (locationError) {
              console.error(
                'DEBUG - Error creating location from object:',
                locationError
              );
              throw locationError;
            }
            from_location_id = newFromLocation.location_id;
            console.log(
              'DEBUG - Created new location from object:',
              from_location_id
            );
          }
        }

        // Handle case where from_location_id is a stringified JSON object
        else if (
          typeof from_location_id === 'string' &&
          from_location_id.startsWith('{')
        ) {
          try {
            console.log(
              'DEBUG - from_location_id appears to be a stringified JSON object'
            );
            const parsedFromLocation = JSON.parse(from_location_id);
            const { venue, name, city, country } = parsedFromLocation;
            const locationName = venue || name || '';
            console.log('DEBUG - parsed stringified from_location:', {
              locationName,
              city,
              country,
            });

            // Check if location exists
            const { data: existingFromLocation } = await supabase
              .from('location')
              .select('location_id')
              .eq('name', locationName)
              .eq('city', city)
              .eq('country', country)
              .single();

            if (existingFromLocation) {
              from_location_id = existingFromLocation.location_id;
              console.log(
                'DEBUG - Found existing location from stringified JSON:',
                from_location_id
              );
            } else {
              // Create new location
              const { data: newFromLocation, error: locationError } =
                await supabase
                  .from('location')
                  .insert({
                    name: locationName,
                    city,
                    country,
                  })
                  .select('location_id')
                  .single();

              if (locationError) {
                console.error(
                  'DEBUG - Error creating location from stringified JSON:',
                  locationError
                );
                throw locationError;
              }
              from_location_id = newFromLocation.location_id;
              console.log(
                'DEBUG - Created new location from stringified JSON:',
                from_location_id
              );
            }
          } catch (e) {
            console.error(
              'DEBUG - Error parsing stringified from_location_id:',
              e
            );
          }
        }

        // Process from_location field if available
        if (
          typeof body.from_location === 'object' &&
          body.from_location !== null
        ) {
          const { venue, name, city, country } = body.from_location;
          const locationName = venue || name || '';
          console.log('DEBUG - from_location object parsed:', {
            locationName,
            city,
            country,
          });

          // Check if location exists
          const { data: existingFromLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingFromLocation) {
            from_location_id = existingFromLocation.location_id;
            console.log(
              'DEBUG - Found existing location from from_location field:',
              from_location_id
            );
          } else {
            // Create new location
            const { data: newFromLocation, error: locationError } =
              await supabase
                .from('location')
                .insert({
                  name: locationName,
                  city,
                  country,
                })
                .select('location_id')
                .single();

            if (locationError) {
              console.error(
                'DEBUG - Error creating location from from_location field:',
                locationError
              );
              throw locationError;
            }
            from_location_id = newFromLocation.location_id;
            console.log(
              'DEBUG - Created new location from from_location field:',
              from_location_id
            );
          }
        }

        // Handle to_location if it's an object instead of an ID
        let to_location_id = body.to_location_id;
        console.log('DEBUG - to_location_id type:', typeof to_location_id);
        console.log('DEBUG - to_location_id value:', to_location_id);

        // DEBUGGING: Check if to_location_id is a problematic value
        if (to_location_id && typeof to_location_id === 'object') {
          console.log(
            'DEBUG - to_location_id is an object, not a primitive:',
            to_location_id
          );
          // Convert object to ID
          const toLocationObj = to_location_id;
          const { venue, name, city, country } = toLocationObj;
          const locationName = venue || name || '';

          // Check if location exists
          const { data: existingToLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingToLocation) {
            to_location_id = existingToLocation.location_id;
            console.log(
              'DEBUG - Found existing location from object:',
              to_location_id
            );
          } else {
            // Create new location
            const { data: newToLocation, error: locationError } = await supabase
              .from('location')
              .insert({
                name: locationName,
                city,
                country,
              })
              .select('location_id')
              .single();

            if (locationError) {
              console.error(
                'DEBUG - Error creating location from object:',
                locationError
              );
              throw locationError;
            }
            to_location_id = newToLocation.location_id;
            console.log(
              'DEBUG - Created new location from object:',
              to_location_id
            );
          }
        }

        // Handle case where to_location_id is a stringified JSON object
        else if (
          typeof to_location_id === 'string' &&
          to_location_id.startsWith('{')
        ) {
          try {
            console.log(
              'DEBUG - to_location_id appears to be a stringified JSON object'
            );
            const parsedToLocation = JSON.parse(to_location_id);
            const { venue, name, city, country } = parsedToLocation;
            const locationName = venue || name || '';
            console.log('DEBUG - parsed stringified to_location:', {
              locationName,
              city,
              country,
            });

            // Check if location exists
            const { data: existingToLocation } = await supabase
              .from('location')
              .select('location_id')
              .eq('name', locationName)
              .eq('city', city)
              .eq('country', country)
              .single();

            if (existingToLocation) {
              to_location_id = existingToLocation.location_id;
              console.log(
                'DEBUG - Found existing location from stringified JSON:',
                to_location_id
              );
            } else {
              // Create new location
              const { data: newToLocation, error: locationError } =
                await supabase
                  .from('location')
                  .insert({
                    name: locationName,
                    city,
                    country,
                  })
                  .select('location_id')
                  .single();

              if (locationError) {
                console.error(
                  'DEBUG - Error creating location from stringified JSON:',
                  locationError
                );
                throw locationError;
              }
              to_location_id = newToLocation.location_id;
              console.log(
                'DEBUG - Created new location from stringified JSON:',
                to_location_id
              );
            }
          } catch (e) {
            console.error(
              'DEBUG - Error parsing stringified to_location_id:',
              e
            );
          }
        }

        // Process to_location field if available
        if (typeof body.to_location === 'object' && body.to_location !== null) {
          const { venue, name, city, country } = body.to_location;
          const locationName = venue || name || '';
          console.log('DEBUG - to_location object parsed:', {
            locationName,
            city,
            country,
          });

          // Check if location exists
          const { data: existingToLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingToLocation) {
            to_location_id = existingToLocation.location_id;
            console.log(
              'DEBUG - Found existing location from to_location field:',
              to_location_id
            );
          } else {
            // Create new location
            const { data: newToLocation, error: locationError } = await supabase
              .from('location')
              .insert({
                name: locationName,
                city,
                country,
              })
              .select('location_id')
              .single();

            if (locationError) {
              console.error(
                'DEBUG - Error creating location from to_location field:',
                locationError
              );
              throw locationError;
            }
            to_location_id = newToLocation.location_id;
            console.log(
              'DEBUG - Created new location from to_location field:',
              to_location_id
            );
          }
        }

        console.log('DEBUG - Final from_location_id:', from_location_id);
        console.log('DEBUG - Final to_location_id:', to_location_id);

        // Ensure we have valid integer IDs for locations
        if (from_location_id === null || from_location_id === undefined) {
          console.error('DEBUG - from_location_id is null or undefined');
          // Create a default location if from_location_id is missing
          const { data: defaultFromLocation, error: defLocationError } =
            await supabase
              .from('location')
              .insert({
                name: 'Unknown Origin',
                city: 'Unknown',
                country: 'Unknown',
              })
              .select('location_id')
              .single();

          if (defLocationError) throw defLocationError;
          from_location_id = defaultFromLocation.location_id;
          console.log(
            'DEBUG - Created default from_location:',
            from_location_id
          );
        }

        if (to_location_id === null || to_location_id === undefined) {
          console.error('DEBUG - to_location_id is null or undefined');
          // Create a default location if to_location_id is missing
          const { data: defaultToLocation, error: defLocationError } =
            await supabase
              .from('location')
              .insert({
                name: 'Unknown Destination',
                city: 'Unknown',
                country: 'Unknown',
              })
              .select('location_id')
              .single();

          if (defLocationError) throw defLocationError;
          to_location_id = defaultToLocation.location_id;
          console.log('DEBUG - Created default to_location:', to_location_id);
        }

        // Convert to numbers if they are strings to ensure proper DB insert
        if (typeof from_location_id === 'string') {
          try {
            from_location_id = parseInt(from_location_id, 10);
            console.log(
              'DEBUG - Converted from_location_id string to number:',
              from_location_id
            );
          } catch (e) {
            console.error(
              'DEBUG - Error converting from_location_id to number:',
              e
            );
          }
        }

        if (typeof to_location_id === 'string') {
          try {
            to_location_id = parseInt(to_location_id, 10);
            console.log(
              'DEBUG - Converted to_location_id string to number:',
              to_location_id
            );
          } catch (e) {
            console.error(
              'DEBUG - Error converting to_location_id to number:',
              e
            );
          }
        }

        console.log('DEBUG - Insert travel_event with:', {
          event_id: event.event_id,
          from_location_id,
          to_location_id,
          transport_type: body.transport_type,
        });

        const { error: travelError } = await supabase
          .from('travel_event')
          .insert({
            event_id: event.event_id,
            from_location_id,
            to_location_id,
            transport_type: body.transport_type,
          });
        if (travelError) {
          console.error('DEBUG - Travel event insert error:', travelError);
          throw travelError;
        }
        break;

      case 3: // Hotel Stay
        const { error: hotelError } = await supabase
          .from('hotel_stay_event')
          .insert({
            event_id: event.event_id,
            hotel_name: body.hotel_name,
          });
        if (hotelError) throw hotelError;
        break;

      case 4: // Rest Day
        const { error: restDayError } = await supabase
          .from('rest_day_event')
          .insert({
            event_id: event.event_id,
          });
        if (restDayError) throw restDayError;
        break;

      case 5: // Recovery Therapy
        const { error: therapyError } = await supabase
          .from('recovery_therapy_event')
          .insert({
            event_id: event.event_id,
            therapy_type_id: body.therapy_type_id,
          });
        if (therapyError) throw therapyError;
        break;

      case 6: // Training
        const { error: trainingError } = await supabase
          .from('training_event')
          .insert({
            event_id: event.event_id,
            training_type: body.training_type,
            gps_data: body.gps_data,
          });
        if (trainingError) throw trainingError;
        break;
    }

    // Handle participants if provided
    if (body.participants && body.participants.length > 0) {
      const { error: participantError } = await supabase
        .from('event_participant')
        .insert(
          body.participants.map((athlete_id: number) => ({
            event_id: event.event_id,
            athlete_id,
          }))
        );
      if (participantError) throw participantError;
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Handle location creation/lookup
    let location_id = null;

    if (body.location) {
      const { venue, name, city, country } = body.location;
      // Use venue if available, otherwise fall back to name, or empty string
      const locationName = venue || name || '';

      // Check if location exists
      const { data: existingLocation } = await supabase
        .from('location')
        .select('location_id')
        .eq('name', locationName)
        .eq('city', city)
        .eq('country', country)
        .single();

      if (existingLocation) {
        location_id = existingLocation.location_id;
      } else {
        // Create new location
        const { data: newLocation, error: locationError } = await supabase
          .from('location')
          .insert({
            name: locationName,
            city,
            country,
          })
          .select('location_id')
          .single();

        if (locationError) throw locationError;
        location_id = newLocation.location_id;
      }
    }

    // Update the base event
    const { data: event, error: eventError } = await supabase
      .from('event')
      .update({
        team_id: body.team_id,
        event_type_id: body.event_type_id,
        start_time: body.start_time,
        end_time: body.end_time,
        location_id: location_id,
        notes: body.notes,
        title: body.title,
      })
      .eq('event_id', body.event_id)
      .select()
      .single();

    if (eventError) throw eventError;

    // Handle event-specific data based on event type
    switch (body.event_type_id) {
      case 1: // Match
        const { error: matchError } = await supabase
          .from('match_event')
          .update({
            opponent: body.opponent,
            gps_data: body.gps_data,
          })
          .eq('event_id', body.event_id);
        if (matchError) throw matchError;
        break;

      case 2: // Travel
        // DEBUGGING: Log the entire body for travel event update
        console.log(
          'DEBUG - Full travel event update body:',
          JSON.stringify(body)
        );

        // Handle from_location if it's an object instead of an ID
        let from_location_id = body.from_location_id;
        console.log(
          'DEBUG - PUT from_location_id type:',
          typeof from_location_id
        );
        console.log('DEBUG - PUT from_location_id value:', from_location_id);

        // DEBUGGING: Check if from_location_id is a problematic value
        if (from_location_id && typeof from_location_id === 'object') {
          console.log(
            'DEBUG - PUT from_location_id is an object, not a primitive:',
            from_location_id
          );
          // Convert object to ID
          const fromLocationObj = from_location_id;
          const { venue, name, city, country } = fromLocationObj;
          const locationName = venue || name || '';

          // Check if location exists
          const { data: existingFromLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingFromLocation) {
            from_location_id = existingFromLocation.location_id;
            console.log(
              'DEBUG - PUT Found existing location from object:',
              from_location_id
            );
          } else {
            // Create new location
            const { data: newFromLocation, error: locationError } =
              await supabase
                .from('location')
                .insert({
                  name: locationName,
                  city,
                  country,
                })
                .select('location_id')
                .single();

            if (locationError) {
              console.error(
                'DEBUG - PUT Error creating location from object:',
                locationError
              );
              throw locationError;
            }
            from_location_id = newFromLocation.location_id;
            console.log(
              'DEBUG - PUT Created new location from object:',
              from_location_id
            );
          }
        }

        // Handle to_location if it's an object instead of an ID
        let to_location_id = body.to_location_id;
        console.log('DEBUG - PUT to_location_id type:', typeof to_location_id);
        console.log('DEBUG - PUT to_location_id value:', to_location_id);

        // DEBUGGING: Check if to_location_id is a problematic value
        if (to_location_id && typeof to_location_id === 'object') {
          console.log(
            'DEBUG - PUT to_location_id is an object, not a primitive:',
            to_location_id
          );
          // Convert object to ID
          const toLocationObj = to_location_id;
          const { venue, name, city, country } = toLocationObj;
          const locationName = venue || name || '';

          // Check if location exists
          const { data: existingToLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingToLocation) {
            to_location_id = existingToLocation.location_id;
            console.log(
              'DEBUG - PUT Found existing location from object:',
              to_location_id
            );
          } else {
            // Create new location
            const { data: newToLocation, error: locationError } = await supabase
              .from('location')
              .insert({
                name: locationName,
                city,
                country,
              })
              .select('location_id')
              .single();

            if (locationError) {
              console.error(
                'DEBUG - PUT Error creating location from object:',
                locationError
              );
              throw locationError;
            }
            to_location_id = newToLocation.location_id;
            console.log(
              'DEBUG - PUT Created new location from object:',
              to_location_id
            );
          }
        }

        // Handle case where from_location_id is a stringified JSON object
        else if (
          typeof from_location_id === 'string' &&
          from_location_id.startsWith('{')
        ) {
          try {
            console.log(
              'DEBUG - PUT from_location_id appears to be a stringified JSON object'
            );
            const parsedFromLocation = JSON.parse(from_location_id);
            const { venue, name, city, country } = parsedFromLocation;
            const locationName = venue || name || '';
            console.log('DEBUG - PUT parsed stringified from_location:', {
              locationName,
              city,
              country,
            });

            // Check if location exists
            const { data: existingFromLocation } = await supabase
              .from('location')
              .select('location_id')
              .eq('name', locationName)
              .eq('city', city)
              .eq('country', country)
              .single();

            if (existingFromLocation) {
              from_location_id = existingFromLocation.location_id;
              console.log(
                'DEBUG - PUT Found existing location from stringified JSON:',
                from_location_id
              );
            } else {
              // Create new location
              const { data: newFromLocation, error: locationError } =
                await supabase
                  .from('location')
                  .insert({
                    name: locationName,
                    city,
                    country,
                  })
                  .select('location_id')
                  .single();

              if (locationError) {
                console.error(
                  'DEBUG - PUT Error creating location from stringified JSON:',
                  locationError
                );
                throw locationError;
              }
              from_location_id = newFromLocation.location_id;
              console.log(
                'DEBUG - PUT Created new location from stringified JSON:',
                from_location_id
              );
            }
          } catch (e) {
            console.error(
              'DEBUG - PUT Error parsing stringified from_location_id:',
              e
            );
          }
        }

        // Handle case where to_location_id is a stringified JSON object
        else if (
          typeof to_location_id === 'string' &&
          to_location_id.startsWith('{')
        ) {
          try {
            console.log(
              'DEBUG - PUT to_location_id appears to be a stringified JSON object'
            );
            const parsedToLocation = JSON.parse(to_location_id);
            const { venue, name, city, country } = parsedToLocation;
            const locationName = venue || name || '';
            console.log('DEBUG - PUT parsed stringified to_location:', {
              locationName,
              city,
              country,
            });

            // Check if location exists
            const { data: existingToLocation } = await supabase
              .from('location')
              .select('location_id')
              .eq('name', locationName)
              .eq('city', city)
              .eq('country', country)
              .single();

            if (existingToLocation) {
              to_location_id = existingToLocation.location_id;
              console.log(
                'DEBUG - PUT Found existing location from stringified JSON:',
                to_location_id
              );
            } else {
              // Create new location
              const { data: newToLocation, error: locationError } =
                await supabase
                  .from('location')
                  .insert({
                    name: locationName,
                    city,
                    country,
                  })
                  .select('location_id')
                  .single();

              if (locationError) {
                console.error(
                  'DEBUG - PUT Error creating location from stringified JSON:',
                  locationError
                );
                throw locationError;
              }
              to_location_id = newToLocation.location_id;
              console.log(
                'DEBUG - PUT Created new location from stringified JSON:',
                to_location_id
              );
            }
          } catch (e) {
            console.error(
              'DEBUG - PUT Error parsing stringified to_location_id:',
              e
            );
          }
        }

        // Process from_location field if available
        if (
          typeof body.from_location === 'object' &&
          body.from_location !== null
        ) {
          const { venue, name, city, country } = body.from_location;
          const locationName = venue || name || '';
          console.log('DEBUG - PUT from_location object parsed:', {
            locationName,
            city,
            country,
          });

          // Check if location exists
          const { data: existingFromLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingFromLocation) {
            from_location_id = existingFromLocation.location_id;
            console.log(
              'DEBUG - PUT Found existing location from from_location field:',
              from_location_id
            );
          } else {
            // Create new location
            const { data: newFromLocation, error: locationError } =
              await supabase
                .from('location')
                .insert({
                  name: locationName,
                  city,
                  country,
                })
                .select('location_id')
                .single();

            if (locationError) {
              console.error(
                'DEBUG - PUT Error creating location from from_location field:',
                locationError
              );
              throw locationError;
            }
            from_location_id = newFromLocation.location_id;
            console.log(
              'DEBUG - PUT Created new location from from_location field:',
              from_location_id
            );
          }
        }

        // Process to_location field if available
        if (typeof body.to_location === 'object' && body.to_location !== null) {
          const { venue, name, city, country } = body.to_location;
          const locationName = venue || name || '';
          console.log('DEBUG - PUT to_location object parsed:', {
            locationName,
            city,
            country,
          });

          // Check if location exists
          const { data: existingToLocation } = await supabase
            .from('location')
            .select('location_id')
            .eq('name', locationName)
            .eq('city', city)
            .eq('country', country)
            .single();

          if (existingToLocation) {
            to_location_id = existingToLocation.location_id;
            console.log(
              'DEBUG - PUT Found existing location from to_location field:',
              to_location_id
            );
          } else {
            // Create new location
            const { data: newToLocation, error: locationError } = await supabase
              .from('location')
              .insert({
                name: locationName,
                city,
                country,
              })
              .select('location_id')
              .single();

            if (locationError) {
              console.error(
                'DEBUG - PUT Error creating location from to_location field:',
                locationError
              );
              throw locationError;
            }
            to_location_id = newToLocation.location_id;
            console.log(
              'DEBUG - PUT Created new location from to_location field:',
              to_location_id
            );
          }
        }

        console.log('DEBUG - PUT Final from_location_id:', from_location_id);
        console.log('DEBUG - PUT Final to_location_id:', to_location_id);

        // Ensure we have valid integer IDs for locations
        if (from_location_id === null || from_location_id === undefined) {
          console.log('DEBUG - PUT from_location_id is null or undefined');
          // Create a default location if from_location_id is missing
          const { data: defaultFromLocation, error: defLocationError } =
            await supabase
              .from('location')
              .insert({
                name: 'Unknown Origin',
                city: 'Unknown',
                country: 'Unknown',
              })
              .select('location_id')
              .single();

          if (defLocationError) throw defLocationError;
          from_location_id = defaultFromLocation.location_id;
          console.log(
            'DEBUG - PUT Created default from_location:',
            from_location_id
          );
        }

        if (to_location_id === null || to_location_id === undefined) {
          console.log('DEBUG - PUT to_location_id is null or undefined');
          // Create a default location if to_location_id is missing
          const { data: defaultToLocation, error: defLocationError } =
            await supabase
              .from('location')
              .insert({
                name: 'Unknown Destination',
                city: 'Unknown',
                country: 'Unknown',
              })
              .select('location_id')
              .single();

          if (defLocationError) throw defLocationError;
          to_location_id = defaultToLocation.location_id;
          console.log(
            'DEBUG - PUT Created default to_location:',
            to_location_id
          );
        }

        // Convert to numbers if they are strings to ensure proper DB insert
        if (typeof from_location_id === 'string') {
          try {
            from_location_id = parseInt(from_location_id, 10);
            console.log(
              'DEBUG - PUT Converted from_location_id string to number:',
              from_location_id
            );
          } catch (e) {
            console.error(
              'DEBUG - PUT Error converting from_location_id to number:',
              e
            );
          }
        }

        if (typeof to_location_id === 'string') {
          try {
            to_location_id = parseInt(to_location_id, 10);
            console.log(
              'DEBUG - PUT Converted to_location_id string to number:',
              to_location_id
            );
          } catch (e) {
            console.error(
              'DEBUG - PUT Error converting to_location_id to number:',
              e
            );
          }
        }

        console.log('DEBUG - PUT Update travel_event with:', {
          event_id: body.event_id,
          from_location_id,
          to_location_id,
          transport_type: body.transport_type,
        });

        const { error: travelError } = await supabase
          .from('travel_event')
          .update({
            from_location_id,
            to_location_id,
            transport_type: body.transport_type,
          })
          .eq('event_id', body.event_id);
        if (travelError) {
          console.error('DEBUG - PUT Travel event update error:', travelError);
          throw travelError;
        }
        break;

      case 3: // Hotel Stay
        const { error: hotelError } = await supabase
          .from('hotel_stay_event')
          .update({
            hotel_name: body.hotel_name,
          })
          .eq('event_id', body.event_id);
        if (hotelError) throw hotelError;
        break;

      case 4: // Rest Day
        // No specific fields to update for rest day
        break;

      case 5: // Recovery Therapy
        const { error: therapyError } = await supabase
          .from('recovery_therapy_event')
          .update({
            therapy_type_id: body.therapy_type_id,
          })
          .eq('event_id', body.event_id);
        if (therapyError) throw therapyError;
        break;

      case 6: // Training
        const { error: trainingError } = await supabase
          .from('training_event')
          .update({
            training_type: body.training_type,
            gps_data: body.gps_data,
          })
          .eq('event_id', body.event_id);
        if (trainingError) throw trainingError;
        break;
    }

    // Handle participants if provided
    if (body.participants) {
      // First, delete existing participants
      const { error: deleteError } = await supabase
        .from('event_participant')
        .delete()
        .eq('event_id', body.event_id);
      if (deleteError) throw deleteError;

      // Then insert new participants if any
      if (body.participants.length > 0) {
        const { error: participantError } = await supabase
          .from('event_participant')
          .insert(
            body.participants.map((athlete_id: number) => ({
              event_id: body.event_id,
              athlete_id,
            }))
          );
        if (participantError) throw participantError;
      }
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Fetch base events
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
      .eq('team_id', teamId)
      .order('start_time', { ascending: true });

    if (eventsError) throw eventsError;

    // Fetch event-specific data and participants for each event
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        // Fetch event-specific data based on event type
        let eventSpecificData = {};
        switch (event.event_type_id % 6) {
          case 1: // Match
            const { data: matchData } = await supabase
              .from('match_event')
              .select('*')
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = matchData || {};
            break;

          case 2: // Travel
            const { data: travelData } = await supabase
              .from('travel_event')
              .select(
                `
                *,
                from_location:from_location_id (
                  name,
                  city,
                  country
                ),
                to_location:to_location_id (
                  name,
                  city,
                  country
                )
              `
              )
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = travelData || {};
            break;

          case 3: // Hotel Stay
            const { data: hotelData } = await supabase
              .from('hotel_stay_event')
              .select('*')
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = hotelData || {};
            break;

          case 4: // Rest Day
            const { data: restDayData } = await supabase
              .from('rest_day_event')
              .select('*')
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = restDayData || {};
            break;

          case 5: // Recovery Therapy
            const { data: therapyData } = await supabase
              .from('recovery_therapy_event')
              .select('*')
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = therapyData || {};
            break;

          case 6: // Training
            const { data: trainingData } = await supabase
              .from('training_event')
              .select('*')
              .eq('event_id', event.event_id)
              .single();
            eventSpecificData = trainingData || {};
            break;
        }

        // Fetch participants
        const { data: participants } = await supabase
          .from('event_participant')
          .select(
            `
            athlete:athlete_id (
              athlete_id,
              first_name,
              last_name
            )
          `
          )
          .eq('event_id', event.event_id);

        return {
          ...event,
          ...eventSpecificData,
          participants: participants?.map((p) => p.athlete) || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // First, get the event type to know which specific table to delete from
    const { data: event, error: eventError } = await supabase
      .from('event')
      .select('event_type_id')
      .eq('event_id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete event-specific data based on event type
    switch (event.event_type_id % 6) {
      case 1: // Match
        const { error: matchError } = await supabase
          .from('match_event')
          .delete()
          .eq('event_id', eventId);
        if (matchError) throw matchError;
        break;

      case 2: // Travel
        const { error: travelError } = await supabase
          .from('travel_event')
          .delete()
          .eq('event_id', eventId);
        if (travelError) throw travelError;
        break;

      case 3: // Hotel Stay
        const { error: hotelError } = await supabase
          .from('hotel_stay_event')
          .delete()
          .eq('event_id', eventId);
        if (hotelError) throw hotelError;
        break;

      case 4: // Rest Day
        const { error: restDayError } = await supabase
          .from('rest_day_event')
          .delete()
          .eq('event_id', eventId);
        if (restDayError) throw restDayError;
        break;

      case 5: // Recovery Therapy
        const { error: therapyError } = await supabase
          .from('recovery_therapy_event')
          .delete()
          .eq('event_id', eventId);
        if (therapyError) throw therapyError;
        break;

      case 6: // Training
        const { error: trainingError } = await supabase
          .from('training_event')
          .delete()
          .eq('event_id', eventId);
        if (trainingError) throw trainingError;
        break;
    }

    // Delete all participants for this event
    const { error: participantError } = await supabase
      .from('event_participant')
      .delete()
      .eq('event_id', eventId);
    if (participantError) throw participantError;

    // Finally, delete the base event
    const { error: deleteError } = await supabase
      .from('event')
      .delete()
      .eq('event_id', eventId);
    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
