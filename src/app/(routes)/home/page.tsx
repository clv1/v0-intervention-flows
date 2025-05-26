import { createClient } from '@/lib/server';
import { IAthlete, IRecoveryAverageData, IRecoveryData, IWorkloadAverageData, IWorkloadData, User, UserInfo, UserTeam, IPlayerLineChartData, IPerformanceLineChartData, IAllTimeMetricsAverages, IAllTimeMetrics, ITeamMentalState } from '@/lib/types';
import { useUserInfo } from '@/store/useUserInfo';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import MentalStateWindow from './sections/mentalStateWindow';
import PhysicalStateWindow from './sections/physicalStateWindow';
import PlayerDataWindow from "./sections/playerDataWindow";
import SummaryWindow from "./sections/summaryWindow";
import PeriodSelector from '@/components/periodSelector';
import AISummary from './sections/AISummary';
import getAthleteIdsWithSurveySubmission from '../../utils/Survey/getAthleteIdsWithSurveySubmission';
import getAthleteSurveySubmissionCounts from '../../utils/Survey/getAthleteSurveySubmissionCounts';

export default async function Home() {
  const supabase = await createClient()
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

  const [userInfoTable, userTeamTable,] = await Promise.all([
    // Get the user's first and last name from the user_info table
    supabase
      .from("user_info")
      .select("first_name, last_name")
      .eq('user_info_id', userInfoID),
    // Get the user's team ID from the user_team table
    supabase
      .from("user_team")
      .select("team_id")
      .eq('supabase_auth_uid', userID),
  ]);

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



  const [
    recoveryMetricsTable,
    recoveryMetricsAverageTable,
    workloadMetricsTable,
    workloadMetricsAverageTable,
    homepageLineChartRecoveryMetricsTable,
    allTimeMetricsTable,
    allTimeAveragesTable,
    recoverySquadAvailabilityTable,
    alertSystemTable,
    DBRTTable,
    teamMentalStateTable,
    last30DaysCycleAthletesTable,
  ] = await Promise.all([
    supabase
      .schema('calculations_schema')
      .from("recovery_metrics")
      .select()
      .in('athlete_id', athletes.map(athlete => athlete.athlete_id)),
    supabase
      .schema('calculations_schema')
      .from("recovery_metrics_average")

      .select(),
    supabase
      .schema('calculations_schema')
      .from("workload_metrics")
      .select()
      .in('athlete_id', athletes.map(athlete => athlete.athlete_id)),
    supabase
      .schema('calculations_schema')
      .from("workload_metrics_average")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("homepage_line_chart_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("all_time_metrics")
      .select()
      .in('athlete_id', athletes.map(athlete => athlete.athlete_id))
      .gte('label', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('label', new Date().toISOString()),
    supabase
      .schema('calculations_schema')
      .from("all_time_metrics_averages")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("recovery_squad_availability")
      .select()
      .in('athlete_id', athletes.map(athlete => athlete.athlete_id)),
    supabase
      .schema('calculations_schema')
      .from("alert_system")
      .select()
      .in('athlete_id', athletes.map(athlete => athlete.athlete_id)),
    supabase
      .schema('calculations_schema')
      .from("dbrt")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("team_mental_state")
      .select()
      .eq('team_id', userInfo.teamID),
    supabase
      .schema('public')
      .from('cycle')
      .select('cycle_id, athlete_id, cycle_date')
      .gte('cycle_date', new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()), // 30 days including today

  ]);


  const recoveryMetrics: IRecoveryData[] = JSON.parse(JSON.stringify(recoveryMetricsTable, null, 2)).data;
  const recoveryMetricsAverage: IRecoveryAverageData[] = JSON.parse(JSON.stringify(recoveryMetricsAverageTable, null, 2)).data;
  const workloadMetrics: IWorkloadData[] = JSON.parse(JSON.stringify(workloadMetricsTable, null, 2)).data;
  const workloadMetricsAverage: IWorkloadAverageData[] = JSON.parse(JSON.stringify(workloadMetricsAverageTable, null, 2)).data;
  const homepageLineChartRecoveryMetrics: IPlayerLineChartData[] = JSON.parse(JSON.stringify(homepageLineChartRecoveryMetricsTable, null, 2)).data;
  const allTimeMetrics: IAllTimeMetrics[] = JSON.parse(JSON.stringify(allTimeMetricsTable, null, 2)).data;
  const allTimeAverages: IAllTimeMetricsAverages[] = JSON.parse(JSON.stringify(allTimeAveragesTable, null, 2)).data;
  const recoverySquadAvailability = JSON.parse(JSON.stringify(recoverySquadAvailabilityTable, null, 2)).data;
  const alertSystemValues = JSON.parse(JSON.stringify(alertSystemTable, null, 2)).data;
  const DBRTValues = JSON.parse(JSON.stringify(DBRTTable, null, 2)).data[0];
  const last30DaysCycleAthletes: { cycle_id: number, athlete_id: number, cycle_date: string }[] = JSON.parse(JSON.stringify(last30DaysCycleAthletesTable, null, 2)).data;

  const teamMentalState: ITeamMentalState = JSON.parse(JSON.stringify(teamMentalStateTable, null, 2)).data[0];

  //* Get the athlete IDs with survey submission
  const athleteIdsWithSurveySubmission: { athlete_id: number }[] = await getAthleteIdsWithSurveySubmission(supabase, athletes);

  //* Get the survey submission counts for each athlete
  const athleteSurveySubmissionCounts = await getAthleteSurveySubmissionCounts(supabase, last30DaysCycleAthletes);


  return (
    <>
      <main id='home-main' className='container'>
        <div className='row'>
          <div className='col-12 d-flex flex-column justify-content-center align-items-center'>
            <PeriodSelector />
          </div>
        </div>
        <div className='row'>
          <div className='col-12 d-flex flex-column justify-content-center align-items-center'>
            <SummaryWindow recovery={recoveryMetricsAverage} workload={workloadMetricsAverage} athletes={athletes} recoverySquadAvailability={recoverySquadAvailability} DBRTValues={DBRTValues} />
          </div>
        </div>
        <div className='row'>
          <div className='col-12 col-xl-7'>
            <PlayerDataWindow athletes={athletes} metrics={[recoveryMetrics, workloadMetrics]} allTimeMetrics={allTimeMetrics} allTimeAverages={allTimeAverages} alertSystemValues={alertSystemValues} athleteIdsWithSurveySubmission={athleteIdsWithSurveySubmission} athleteSurveySubmissionCounts={athleteSurveySubmissionCounts} />
          </div>
          <div className='col-12 col-xl-5'>
            <div className='row'>
              <div className='col-6 col-xl-12'>
                <AISummary athletes={athletes} recoveryMetrics={recoveryMetrics} recoveryMetricsAverage={recoveryMetricsAverage} workloadMetrics={workloadMetrics} workloadMetricsAverage={workloadMetricsAverage} allTimeAverages={allTimeAverages} />
                <div className='col-6 col-xl-12'>
                  <PhysicalStateWindow metrics={homepageLineChartRecoveryMetrics} athletes={athletes} />
                </div>
              </div>
              <div className='col-6 col-xl-12'>
                <MentalStateWindow teamMentalState={teamMentalState} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
