'use client';

import { IAthlete, IAthleteMetrics } from '@/lib/types';
import { useParams } from 'next/navigation';
import './playerCard.css';

export default function PlayerCard({ athletes, athleteMetrics }: { athletes: IAthlete[], athleteMetrics: IAthleteMetrics[] }) {
  const { id } = useParams();

  // Find the athlete that matches the ID from the URL
  const today = new Date();
  const athlete = athletes.find(athlete => athlete.athlete_id === Number(id));
  const athleteMetric = athleteMetrics
    .filter(metric => metric.athlete_id === Number(id))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return Math.abs(today.getTime() - dateA.getTime()) - Math.abs(today.getTime() - dateB.getTime());
    })[0];

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div id='player-card' className='d-flex flex-column gap-4'>
      <div className='d-flex flex-column'>
        <div className='d-flex justify-content-around'>
          <i className="bi bi-person-circle d-flex justify-content-center align-items-center"></i>
          <div className='d-flex flex-column justify-content-around'>
            <p id='name'>{athlete?.first_name} {athlete?.last_name.charAt(0)}.</p>
            <p id='position'>Attacking Midfielder #10</p>
          </div>
        </div>
      </div>
      <hr />
      <div className='d-flex flex-column gap-2 player-stats'>
        <p>Age: {athlete?.date_of_birth ? calculateAge(athlete.date_of_birth) : '-'}</p>
        <p>Height: {athleteMetric?.height_meter}</p>
        <p>Weight: {athleteMetric?.weight_kilogram}</p>
      </div>
    </div>
  )
}