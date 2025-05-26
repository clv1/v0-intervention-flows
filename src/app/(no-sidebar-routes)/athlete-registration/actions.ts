'use server';
import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/lib/cryptoUtils';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function checkWhoopCredentials(formData: FormData) {
	const whoop_email = formData.get('whoop_email') as string;
	const whoop_password = formData.get('whoop_password') as string;

	const response = await fetch('https://api-7.whoop.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'password',
			username: whoop_email,
			password: whoop_password,
		}),
	});
	const data = await response.json();
	return { status: response.status, data: data };
}

export async function registerAthlete(
	formData: FormData,
	whoopUserId: number,
	teamId: number
) {
	try {
		const first_name = formData.get('first_name') as string;
		const last_name = formData.get('last_name') as string;
		const date_of_birth = formData.get('date_of_birth') as string;
		const gender = formData.get('gender') as string;
		const phone_number = formData.get('phone_number') as string;
		const whoop_email = formData.get('whoop_email') as string;
		const whoop_password = formData.get('whoop_password') as string;

		if (
			!first_name ||
			!last_name ||
			!date_of_birth ||
			!gender ||
			!phone_number ||
			!whoop_email ||
			!whoop_password
		) {
			throw new Error('Missing required athlete information.');
		}
		// const encryptedWhoopEmail = encrypt(whoop_email);
		// const encryptedWhoopPassword = encrypt(whoop_password);

		const athleteData = {
			athlete_version: 1,
			whoop_email,
			whoop_password: whoop_password,
			whoop_user_id: whoopUserId,
			phone_number,
			first_name,
			last_name,
			date_of_birth,
			gender,
			team_id: teamId,
		};

		const { data, error } = await supabase
			.from('athlete')
			.insert([athleteData]);

		if (error) {
			throw new Error(`Failed to insert athlete: ${error.message}`);
		}

		return { success: true, data };
	} catch (error) {
		console.error('Error in registerAthlete:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
}
export async function convertTeamUuidToID(teamUuid: string) {
	const teamTable: PostgrestSingleResponse<any> = await supabase
		.from('team')
		.select('team_id, team_registration')
		.eq('team_uuid', teamUuid);

	if (teamTable.data.length === 0) {
		return undefined;
	}

	console.log(teamTable.data[0]);

	// if (!teamTable.data[0].team_registration) {
	//   return undefined;
	// }

	const teamID = teamTable.data[0].team_id;
	return teamID;
}

// export async function testAthleteDecryption(athleteId: number) {
//   try {
//     const { data, error } = await supabase
//       .from('athlete')
//       .select('whoop_email, whoop_password')
//       .eq('athlete_id', athleteId)
//       .single();

//     if (error) {
//       console.log(error);
//     }
//     if (data !== null) {
//       return {
//         whoop_email: decrypt(data.whoop_email),
//         whoop_password: decrypt(data.whoop_password),
//       };
//     }
//   } catch (error) {
//     console.error('Error fetching credentials:', error);
//     return null;
//   }
// }
