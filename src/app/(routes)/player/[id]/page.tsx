import PeriodSelector from '@/components/periodSelector';
import { createClient } from '@/lib/server';
import { IAthlete, IAthleteMentalState, IAthleteMetrics, IPlayerLineChartData, IRecoveryAverageData, IRecoveryData, IWorkloadAverageData, IWorkloadData, IWorkloadMetrics, UserTeam } from '@/lib/types';
import '@/styles/global.css';
import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import PlayerSelector from '../../../components/playerSelector';
import PlayerCard from '../components/playerCard';
import AISummaryWindow from '../sections/AISummaryWindow';
import BehaviourInsightsWindow from '../sections/behaviourInsightsWindow';
import PerformanceSummaryWindow from '../sections/performanceSummaryWindow';
import PhysicalStateWindow from '../sections/physicalStateWindow';
import SummaryWindow from '../sections/summaryWindow';

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser()
  if (!data?.user) return;
  const userID = data.user.id

  // Get the user's team ID from the user_team table
  const userTeamTable: PostgrestSingleResponse<UserTeam[]> = await supabase
    .from("user_team")
    .select("team_id")
    .eq('supabase_auth_uid', userID);
  const teamID = userTeamTable.data ? Number(userTeamTable.data[0].team_id) : undefined;


  // Fetch all data concurrently using Promise.all
  const [
    athleteTable,
    athleteMetricsTable,
    recoveryMetricsTable,
    workloadMetricsTable,
    recoveryMetricsAverageTable,
    workloadMetricsAverageTable,
    playerLineChartMetricsTable,
    athleteMentalStateTable
  ] = await Promise.all([
    // Base tables
    supabase
      .from("athlete")
      .select()
      .eq('team_id', teamID),
    supabase
      .from("athlete_metrics")
      .select(),
    // Calculated metrics from calculations schema
    supabase
      .schema('calculations_schema')
      .from("recovery_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("workload_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("recovery_metrics_average")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("workload_metrics_average")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("player_line_chart_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("athlete_mental_state")
      .select()
      .eq('athlete_id', params.id)
  ]);

  const athletes: IAthlete[] = JSON.parse(JSON.stringify(athleteTable, null, 2)).data;
  const athleteMetrics: IAthleteMetrics[] = JSON.parse(JSON.stringify(athleteMetricsTable, null, 2)).data;
  const recoveryMetrics: IRecoveryData[] = JSON.parse(JSON.stringify(recoveryMetricsTable, null, 2)).data;
  const workloadMetrics: IWorkloadData[] = JSON.parse(JSON.stringify(workloadMetricsTable, null, 2)).data;
  const recoveryMetricsAverage: IRecoveryAverageData[] = JSON.parse(JSON.stringify(recoveryMetricsAverageTable, null, 2)).data;
  const workloadMetricsAverage: IWorkloadAverageData[] = JSON.parse(JSON.stringify(workloadMetricsAverageTable, null, 2)).data;
  const playerLineChartMetrics: IPlayerLineChartData[] = JSON.parse(JSON.stringify(playerLineChartMetricsTable, null, 2)).data;
  const recoverySquadAvailabilityTable = await supabase
    .schema('calculations_schema')
    .from("recovery_squad_availability")
    .select()
    .in('athlete_id', athletes.map(athlete => athlete.athlete_id));
  const recoverySquadAvailability = JSON.parse(JSON.stringify(recoverySquadAvailabilityTable, null, 2)).data;
  const athleteMentalState: IAthleteMentalState[] = JSON.parse(JSON.stringify(athleteMentalStateTable, null, 2)).data;
  return (
    <>
      <main id='player-page-main' className='container'>
        <div className='d-flex flex-column gap-3'>
          <div className='row'>
            <div className='col-12 d-flex flex-column justify-content-center align-items-center'>
              <PlayerSelector athletes={athletes} routeBefore='player' visiblePlayers={3} />
            </div>
          </div>
          <div className='row'>
            <div className='col-6 p-0 gap-3 d-flex flex-column justify-content-start align-items-center'>
              <div className='row'>
                <div className='col-12 d-flex flex-column justify-content-center align-items-center'>
                  <PeriodSelector />
                </div>
              </div>
              <div className='row w-100'>
                <div className='col-6 d-flex flex-column justify-content-center align-items-center'>
                  <PlayerCard athletes={athletes} athleteMetrics={athleteMetrics} />
                </div>
                <div className='col-6 d-flex flex-column justify-content-center align-items-center'>
                  <SummaryWindow recovery={recoveryMetrics} workload={workloadMetrics} athletes={athletes} recoverySquadAvailability={recoverySquadAvailability} />
                </div>
              </div>
              <div className='row w-100'>
                <div className='col-12 d-flex flex-column justify-content-center align-items-center w-100'>
                  <PhysicalStateWindow metrics={playerLineChartMetrics} athletes={athletes} />
                </div>
              </div>
            </div>
            <div className='col-6 p-0 d-flex flex-column justify-content-between'>
              <div className='row w-100'>
                <div className='col-41point33 d-flex flex-column justify-content-center align-items-center'>
                  <BehaviourInsightsWindow />
                </div>
                <div className='col-58point66 d-flex flex-column gap-3 h-100'>
                  <div className='row'>
                    <PerformanceSummaryWindow recovery={recoveryMetricsAverage} workload={workloadMetricsAverage} athletes={athletes} athleteMentalState={athleteMentalState} />
                  </div>
                  <div className='row flex-grow-1'>
                    <AISummaryWindow />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
