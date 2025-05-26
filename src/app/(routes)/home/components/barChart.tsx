// WORK IN PROGRESS

import { Bar, BarChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis } from 'recharts';
import { ITeamMentalState } from '@/lib/types';

// replace 

const BarChartComponent = ({ teamMentalState }: { teamMentalState: ITeamMentalState }) => {

  const chartData = [
    { name: 'Motivation', profit: teamMentalState.motivation },
    { name: 'Control', profit: teamMentalState.feeling_in_control },
    { name: 'Fulfilled', profit: teamMentalState.social_fulfillment },
    { name: 'Anxiety', profit: teamMentalState.anxiety },
    { name: 'Sickness', profit: teamMentalState.feeling_sick },
    { name: 'Positivity', profit: teamMentalState.positive_anticipation },
    { name: 'Gratitude', profit: teamMentalState.gratitude },
    { name: 'Purpose', profit: teamMentalState.sense_of_purpose },
    { name: 'Learning', profit: teamMentalState.learning },
    { name: 'Progress', profit: teamMentalState.progress_on_goal }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
      >
        <hr />
        <XAxis tick={{ fill: '#ffffff' }} dataKey="name" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="profit" fill="#8b5cf6" barSize={40} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
// #barchart works well

export default BarChartComponent;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#110d20',
        padding: '10px',
        borderRadius: '10px',
        color: '#fff',
        border: '1px solid #888',
      }}>
        <p style={{ margin: 0 }}>{label}</p>
        <p style={{ margin: 0 }}>{` ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
