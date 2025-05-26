'use client'

import { ITeamMentalState } from "@/lib/types";
import BarChartComponent from "../components/barChart";
import './mentalStateWindow.css';

export default function MentalStateWindow({ teamMentalState }: { teamMentalState: ITeamMentalState }) {
  return (
    <div id="mental-data-window">
      <div className="container">
        <div className="barchart">
          <div>
            <BarChartComponent teamMentalState={teamMentalState} />
          </div>
        </div>
      </div>
    </div>
  );
}