import PlayerSelector from "@/components/playerSelector";
import { BehaviourAnalysisSelectors } from "@/data/data";
import { createClient } from "@/lib/server";
import { IAthlete, UserInfo, UserTeam, User } from "@/lib/types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import BehaviourAnalysisSelector from "../../components/behaviourAnalysisSelector";
// import BehaviourFrequency from "../../sections/BehaviourFrequency";
import BehavioursList from "../../sections/behavioursList";
// import LLMSummary from "../../sections/LLMSummary";
import { useUserInfo } from "@/store/useUserInfo";
import RenderedSection from "../../sections/RenderedSection";

export default async function PlayerBehaviourPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser()
  if (!data?.user) return;
  const userID = data.user.id
  // Query the user table to get the user_info_id and role for the authenticated user
  const userTable: PostgrestSingleResponse<User[]> = await supabase
    .from("user")
    .select("user_info_id, role")
    .eq('supabase_auth_uid', userID);

  // Extract user info ID and position from the response
  const userInfoID = JSON.parse(JSON.stringify(userTable, null, 2)).data[0].user_info_id, userInfoPositon = JSON.parse(JSON.stringify(userTable, null, 2)).data[0].role;

  // Get the user's first and last name from the user_info table
  const userInfoTable: PostgrestSingleResponse<UserInfo[]> = await supabase
    .from("user_info")
    .select("first_name, last_name")
    .eq('user_info_id', userInfoID);

  // Get the user's team ID from the user_team table
  const userTeamTable: PostgrestSingleResponse<UserTeam[]> = await supabase
    .from("user_team")
    .select("team_id")
    .eq('supabase_auth_uid', userID);
  const userInfo = {
    firstName: userInfoTable.data ? userInfoTable.data[0].first_name : '',
    lastName: userInfoTable.data ? userInfoTable.data[0].last_name : '',
    position: userInfoPositon,
    teamID: userTeamTable.data ? Number(userTeamTable.data[0].team_id) : undefined,
  };

  useUserInfo.getState().setUserInfo(userInfo);

  const athleteTable: PostgrestSingleResponse<IAthlete[]> = await supabase
    .from("athlete")
    .select()
    .eq('team_id', userInfo.teamID);
  const athletes: IAthlete[] = JSON.parse(JSON.stringify(athleteTable, null, 2)).data;

  return (
    <>
      <main id='player-behaviour-page-main' className='container'>
        <div className='d-flex flex-column gap-3'>
          <div className='row'>
            <div className='col-41point33 d-flex flex-column justify-content-center align-items-center'>
              <PlayerSelector athletes={athletes} routeBefore={`player-behaviour/`} routeAfter={`${BehaviourAnalysisSelectors[0].name}`} visiblePlayers={1} />
            </div>
            <div className='col-58point66 d-flex flex-column justify-content-center align-items-center'>
              <BehaviourAnalysisSelector />
            </div>
          </div>
          <div className='row'>
            <div className='col-22point22 d-flex flex-column justify-content-center align-items-center'>
              <BehavioursList />
            </div>
            <div className='col-77point78 d-flex flex-column justify-content-center align-items-center'>
              <div className='row w-100'>
                <RenderedSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
