import React from 'react';
import AthleteRegister from './AthleteRegister';
import { convertTeamUuidToID } from './actions';

const Page = async ({
	searchParams,
}: {
	searchParams: { team_id?: string }
}) => {
	const teamUuid = searchParams.team_id;
	let validRequest = true;
	let teamID = -1;

	if (teamUuid === undefined) {
		validRequest = false;
	} else {
		teamID = await convertTeamUuidToID(teamUuid);
		validRequest = teamID !== undefined;
	}

	return (
		<>
			{validRequest ? (
				<AthleteRegister teamID={teamID} />
			) : (
				<div className="error-container">
					<h2>Team Registration Link Not Found</h2>
				</div>
			)}
		</>
	);
};

export default Page;