import PeriodSelector from '@/components/periodSelector';
import { createClient } from '@/lib/server';
import { IAllTimeMetrics, IAthlete, IPerformanceLineChartData, IAllTimeMetricsAverages, UserTeam, IAlertSystem } from '@/lib/types';
import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { redirect } from 'next/navigation';
import PlayerSelector from '../../../components/playerSelector';
import Charts from '../sections/charts';
import CheckboxLists from '../sections/checkBoxLists';
import SwitchToggles from '../sections/switchToggles';
import AISummary from '../sections/AISummary';
import calculateAthletesAlerts from '@/utils/Alert-system/calculateAthletesAlerts';
import calculatePlayerPeriodAverages from '@/utils/Alert-system/calculatePlayerPeriodAverages';
import getAthleteEvents from '@/utils/Events/getAthleteEvents';

export default async function PlayerPerformancePage({
  params,
  searchParams
}: {
  params: { id: string },
  searchParams: { m?: string, p?: string }
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  const userID = data.user.id

  // Get the athlete ID from the route params
  const athleteId = params.id;

  // Get the user's team ID from the user_team table
  const userTeamTable: PostgrestSingleResponse<UserTeam[]> = await supabase
    .from("user_team")
    .select("team_id")
    .eq('supabase_auth_uid', userID);
  const teamID = userTeamTable.data ? Number(userTeamTable.data[0].team_id) : undefined;

  if (teamID === undefined) {
    redirect('/login');
  }
  const [
    athleteTable,
    performanceLineChartMetricsTable,
    allTimeMetricsTable,
    allTimeMetricsAveragesTable,
  ] = await Promise.all([
    // Base tables
    supabase
      .from('athlete')
      .select('athlete_id, first_name, last_name, date_of_birth')
      .eq('team_id', teamID),
    supabase
      .schema('calculations_schema')
      .from("performance_line_chart_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("all_time_metrics")
      .select(),
    supabase
      .schema('calculations_schema')
      .from("all_time_metrics_averages")
      .select(),
  ]);

  // Fetch athlete event data (combines both individual and team events)

  const athleteEventData = await getAthleteEvents(athleteId, teamID ? teamID.toString() : '1');
  // console.log(athleteEventData);

  const athletes: IAthlete[] = JSON.parse(JSON.stringify(athleteTable, null, 2)).data;
  const performanceLineChartMetrics: IPerformanceLineChartData[] = JSON.parse(JSON.stringify(performanceLineChartMetricsTable, null, 2)).data;
  const allTimeMetrics: IAllTimeMetrics[] = JSON.parse(JSON.stringify(allTimeMetricsTable, null, 2)).data;
  const allTimeMetricsAverages: IAllTimeMetricsAverages[] = JSON.parse(JSON.stringify(allTimeMetricsAveragesTable, null, 2)).data;

  const alertSystemTable: PostgrestSingleResponse<IAlertSystem[]> = await supabase
    .schema('calculations_schema')
    .from("alert_system")
    .select()
    .in('athlete_id', athletes.map(athlete => athlete.athlete_id));

  const alertSystemValues = JSON.parse(JSON.stringify(alertSystemTable, null, 2)).data;

  const playerPeriodAverages = calculatePlayerPeriodAverages(allTimeMetrics);


  // Calculate athletes alerts
  const athletesAlerts = calculateAthletesAlerts(playerPeriodAverages, allTimeMetricsAverages, alertSystemValues);
  // Access the 'm' URL parameter from searchParams prop
  const mParam = searchParams.m;
  const pParam = searchParams.p;
  return (
    <>
      <main id='player-performance-main' className='container'>
        <div className='d-flex flex-column gap-3 container'>
          <div className='row w-100'>
            <div className='col-7 d-flex flex-column justify-content-center align-items-center'>
              <PlayerSelector athletes={athletes} routeBefore='player-performance' visiblePlayers={3} />
            </div>
            <div className='col-5 d-flex flex-column justify-content-center align-items-center'>
              <PeriodSelector playerPerformancePage={true} pParam={pParam} />
            </div>
          </div>
          <div className='row w-100 d-flex justify-content-around align-items-center'>
            <div id='checkbox-lists-and-switch-toggles' className='col-65 d-flex flex-row justify-content-start align-items-start'
              style={{
                border: '1px solid var(--chart-purple)',
                borderRadius: '10px',
                padding: '10px',
                minHeight: '253px',
                height: '100%',
                backgroundColor: 'var(--dark-purple-2)',
                boxShadow: '2px 4px 8px rgba(86, 62, 122, 0.21)',
              }}>
              <div className='col-8 d-flex flex-column justify-content-center align-items-center'>
                <CheckboxLists mParam={mParam} />
              </div>
              <div className='col-4 d-flex flex-column justify-content-center align-items-center'>
                <SwitchToggles column={true} />
              </div>
            </div>
            <div className='col-4 d-flex flex-column justify-content-start align-items-center'>
              <AISummary
                metrics={performanceLineChartMetrics}
                allTimeMetrics={allTimeMetrics}
                allTimeMetricsAverages={allTimeMetricsAverages}
                athletes={athletes}
              />
            </div>
          </div>
          <div className='row w-100'>
            <Charts
              athletes={athletes}
              metrics={performanceLineChartMetrics}
              allTimeMetrics={allTimeMetrics}
              allTimeMetricsAverages={allTimeMetricsAverages}
              mParam={mParam}
              alertSystemValues={alertSystemValues}
              athletesAlerts={athletesAlerts}
              athleteEvents={athleteEventData.athleteEvents}
              athleteMatchDays={athleteEventData.athleteMatchDays}
            />
          </div>
        </div>
      </main>
    </>
  )
}
