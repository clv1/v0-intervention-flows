import { createClient } from "@/lib/server";
import { DateRange, IAthlete, ICycle, ICycleMetrics, IRecovery, IRecoveryMetrics, ISleep, ISleepPerformance, ISleepStages } from '@/lib/types';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const VALID_RECOVERY_THRESHOLD = 66;
const datePeriods = {
	today: {
		start: new Date().toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	},
	last7Days: {
		start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	},
	last30Days: {
		start: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	},
	last3Months: {
		start: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	},
	last6Months: {
		start: new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	}
};

const lineChartPeriods = {
	homepageToday: Array.from({ length: 7 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
	})),
	homepageLast7Days: Array.from({ length: 7 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - (6 + (7 * i)))).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - (7 * i))).toISOString().split('T')[0]
	})),
	homepageLast30Days: Array.from({ length: 7 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - (29 + (30 * i)))).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - (30 * i))).toISOString().split('T')[0]
	})),
	playerPerformanceLast7Days: Array.from({ length: 7 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
	})),
	playerPerformanceLast30Days: Array.from({ length: 30 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
	})),
	playerPerformanceLast6Months: Array.from({ length: 7 }, (_, i) => ({
		start: new Date(new Date().setDate(new Date().getDate() - (29 + (30 * i)))).toISOString().split('T')[0],
		end: new Date(new Date().setDate(new Date().getDate() - (30 * i))).toISOString().split('T')[0]
	})),
}

const lineChartXAxisData = {
	homepageToday: Array.from({ length: 7 }, (_, i) => {
		if (i === 0) return 'Today';
		const date = new Date();
		date.setDate(date.getDate() - i);
		return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
	}).reverse(),
	homepageLast7Days: lineChartPeriods.homepageLast7Days.map(period => {
		const startDate = new Date(period.start);
		const endDate = new Date(period.end);
		return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}).reverse(),
	homepageLast30Days: lineChartPeriods.homepageLast30Days.map(period => {
		const startDate = new Date(period.start);
		const endDate = new Date(period.end);
		return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}).reverse(),
	performancePageLast7Days: Array.from({ length: 7 }, (_, i) => {
		if (i === 0) return 'Today';
		const date = new Date();
		date.setDate(date.getDate() - i);
		return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
	}).reverse(),
	performancePageLast30Days: lineChartPeriods.playerPerformanceLast30Days.map(period => {
		const startDate = new Date(period.start);
		return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}).reverse(),
	performancePageLast6Months: lineChartPeriods.playerPerformanceLast6Months.map(period => {
		const startDate = new Date(period.start);
		const endDate = new Date(period.end);
		return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}).reverse(),
}

export async function POST(request: Request) {
	const supabase = await createClient();
	const { teamID } = await request.json();

	const [
		athleteResponse1,
		athleteResponse2,
		recoveryResponse1,
		recoveryResponse2,
		recoveryMetricsResponse1,
		recoveryMetricsResponse2,
		cycleResponse1,
		cycleResponse2,
		cycleMetricsResponse1,
		cycleMetricsResponse2,
		sleepResponse1,
		sleepResponse2,
		sleepPerformanceResponse1,
		sleepPerformanceResponse2,
		sleepStagesResponse1,
		sleepStagesResponse2
	] = await Promise.all([
		supabase.from("athlete").select().eq('team_id', teamID).range(0, 999),
		supabase.from("athlete").select().eq('team_id', teamID).range(1000, 1999),
		supabase.from("recovery").select().range(0, 999),
		supabase.from("recovery").select().range(1000, 1999),
		supabase.from("recovery_metrics").select().range(0, 999),
		supabase.from("recovery_metrics").select().range(1000, 1999),
		supabase.from("cycle").select().range(0, 999),
		supabase.from("cycle").select().range(1000, 1999),
		supabase.from("cycle_metrics").select().range(0, 999),
		supabase.from("cycle_metrics").select().range(1000, 1999),
		supabase.from("sleep").select().range(0, 999),
		supabase.from("sleep").select().range(1000, 1999),
		supabase.from("sleep_perf_metrics")
			.select('sleep_id, sleep_performance_percentage, sleep_consistency_percentage, sleep_efficiency_percentage')
			.range(0, 999),
		supabase.from("sleep_perf_metrics")
			.select('sleep_id, sleep_performance_percentage, sleep_consistency_percentage, sleep_efficiency_percentage')
			.range(1000, 1999),
		supabase.from("sleep_stage_metrics")
			.select('sleep_id, total_in_bed_time_milli, total_awake_time_milli, total_slow_wave_sleep_time_milli, total_rem_sleep_time_milli')
			.range(0, 999),
		supabase.from("sleep_stage_metrics")
			.select('sleep_id, total_in_bed_time_milli, total_awake_time_milli, total_slow_wave_sleep_time_milli, total_rem_sleep_time_milli')
			.range(1000, 1999)
	]);

	const athletes1: IAthlete[] = JSON.parse(JSON.stringify(athleteResponse1, null, 2)).data;
	const athletes2: IAthlete[] = JSON.parse(JSON.stringify(athleteResponse2, null, 2)).data;
	const athletes: IAthlete[] = [...athletes1, ...athletes2];

	const recovery1: IRecovery[] = JSON.parse(JSON.stringify(recoveryResponse1, null, 2)).data;
	const recovery2: IRecovery[] = JSON.parse(JSON.stringify(recoveryResponse2, null, 2)).data;
	const recovery: IRecovery[] = [...recovery1, ...recovery2];

	const recoveryMetrics1: IRecoveryMetrics[] = JSON.parse(JSON.stringify(recoveryMetricsResponse1, null, 2)).data;
	const recoveryMetrics2: IRecoveryMetrics[] = JSON.parse(JSON.stringify(recoveryMetricsResponse2, null, 2)).data;
	const recoveryMetrics: IRecoveryMetrics[] = [...recoveryMetrics1, ...recoveryMetrics2];

	const cycles1: ICycle[] = JSON.parse(JSON.stringify(cycleResponse1, null, 2)).data;
	const cycles2: ICycle[] = JSON.parse(JSON.stringify(cycleResponse2, null, 2)).data;
	const cycles: ICycle[] = [...cycles1, ...cycles2];

	const cycleMetrics1: ICycleMetrics[] = JSON.parse(JSON.stringify(cycleMetricsResponse1, null, 2)).data;
	const cycleMetrics2: ICycleMetrics[] = JSON.parse(JSON.stringify(cycleMetricsResponse2, null, 2)).data;
	const cycleMetrics: ICycleMetrics[] = [...cycleMetrics1, ...cycleMetrics2];

	const sleep1: ISleep[] = JSON.parse(JSON.stringify(sleepResponse1, null, 2)).data;
	const sleep2: ISleep[] = JSON.parse(JSON.stringify(sleepResponse2, null, 2)).data;
	const sleep: ISleep[] = [...sleep1, ...sleep2];

	const sleepPerformance1: ISleepPerformance[] = JSON.parse(JSON.stringify(sleepPerformanceResponse1, null, 2)).data;
	const sleepPerformance2: ISleepPerformance[] = JSON.parse(JSON.stringify(sleepPerformanceResponse2, null, 2)).data;
	const sleepPerformance: ISleepPerformance[] = [...sleepPerformance1, ...sleepPerformance2];

	const sleepStages1: ISleepStages[] = JSON.parse(JSON.stringify(sleepStagesResponse1, null, 2)).data;
	const sleepStages2: ISleepStages[] = JSON.parse(JSON.stringify(sleepStagesResponse2, null, 2)).data;
	const sleepStages: ISleepStages[] = [...sleepStages1, ...sleepStages2];

	const oldestCycleDate = cycles.sort((a, b) => new Date(a.cycle_date).getTime() - new Date(b.cycle_date).getTime())[0]?.cycle_date;
	const allTimePeriod: DateRange = {
		start: oldestCycleDate,
		end: new Date().toISOString().split('T')[0]
	};

	// The recovery metric on the homepage for each athlete
	const todayMetrics = calculateMetrics(datePeriods.today, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);
	const last7DaysMetrics = calculateMetrics(datePeriods.last7Days, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);
	const last30DaysMetrics = calculateMetrics(datePeriods.last30Days, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);

	const allRecoveryMetrics = {
		'today': todayMetrics[0],
		'previousDay': todayMetrics[1],
		'todayDifference': todayMetrics[2],
		'last7Days': last7DaysMetrics[0],
		'previous7Days': last7DaysMetrics[1],
		'last7DaysDifference': last7DaysMetrics[2],
		'last30Days': last30DaysMetrics[0],
		'previous30Days': last30DaysMetrics[1],
		'last30DaysDifference': last30DaysMetrics[2],
	}
	const todayValidRecovery = calculateValildRecovery(datePeriods.today, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);
	const last7DaysValidRecovery = calculateValildRecovery(datePeriods.last7Days, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);
	const last30DaysValidRecovery = calculateValildRecovery(datePeriods.last30Days, athletes, recovery, cycles, recoveryMetrics, cycleMetrics);

	const recoverySquadAvailability = {
		'today': todayValidRecovery[0],
		'previousDay': todayValidRecovery[1],
		'last7Days': last7DaysValidRecovery[0],
		'previous7Days': last7DaysValidRecovery[1],
		'last30Days': last30DaysValidRecovery[0],
		'previous30Days': last30DaysValidRecovery[1],
	}
	// The average recovery metric on the homepage's summary indicators
	const allRecoveryMetricsAverage = {
		'today': calculateAverageFromMetrics(allRecoveryMetrics.today, false),
		'todayDifference': (calculateAverageFromMetrics(allRecoveryMetrics.today, false) - calculateAverageFromMetrics(allRecoveryMetrics.previousDay, false)),
		'last7Days': calculateAverageFromMetrics(allRecoveryMetrics.last7Days, false),
		'last7DaysDifference': (calculateAverageFromMetrics(allRecoveryMetrics.last7Days, false) - calculateAverageFromMetrics(allRecoveryMetrics.previous7Days, false)),
		'last30Days': calculateAverageFromMetrics(allRecoveryMetrics.last30Days, false),
		'last30DaysDifference': (calculateAverageFromMetrics(allRecoveryMetrics.last30Days, false) - calculateAverageFromMetrics(allRecoveryMetrics.previous30Days, false)),
	}

	// The workload metric on the homepage for each athlete
	const allWorkloadMetrics = {
		'today': todayMetrics[3],
		'previousDay': todayMetrics[4],
		'todayDifference': todayMetrics[5],
		'last7Days': last7DaysMetrics[3],
		'previous7Days': last7DaysMetrics[4],
		'last7DaysDifference': last7DaysMetrics[5],
		'last30Days': last30DaysMetrics[3],
		'previous30Days': last30DaysMetrics[4],
		'last30DaysDifference': last30DaysMetrics[5],
	}

	// The average workload metric on the homepage's summary indicators
	const allWorkloadMetricsAverage = {
		'today': calculateAverageFromMetrics(allWorkloadMetrics.today, false),
		'todayDifference': (calculateAverageFromMetrics(allWorkloadMetrics.today, false) - calculateAverageFromMetrics(allWorkloadMetrics.previousDay, false)),
		'last7Days': calculateAverageFromMetrics(allWorkloadMetrics.last7Days, false),
		'last7DaysDifference': (calculateAverageFromMetrics(allWorkloadMetrics.last7Days, false) - calculateAverageFromMetrics(allWorkloadMetrics.previous7Days, false)),
		'last30Days': calculateAverageFromMetrics(allWorkloadMetrics.last30Days, false),
		'last30DaysDifference': (calculateAverageFromMetrics(allWorkloadMetrics.last30Days, false) - calculateAverageFromMetrics(allWorkloadMetrics.previous30Days, false)),
	}

	// The homepage's line chart metrics
	const allHomepageLineChartRecoveryMetrics = {
		'today': calculateLineChartMetrics(lineChartPeriods.homepageToday, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[0],
		'last7Days': calculateLineChartMetrics(lineChartPeriods.homepageLast7Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[1],
		'last30Days': calculateLineChartMetrics(lineChartPeriods.homepageLast30Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[2],
	}

	// The player page's line chart metrics
	const allPlayerPageLineChartRecoveryMetrics = {
		'today': calculateLineChartMetrics(lineChartPeriods.homepageToday, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[3],
		'last7Days': calculateLineChartMetrics(lineChartPeriods.homepageLast7Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[4],
		'last30Days': calculateLineChartMetrics(lineChartPeriods.homepageLast30Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[5],
	}

	// The player performance page's line chart metrics
	const allPerformancePageLineChartRecoveryMetrics = {
		'last7Days': calculateLineChartMetrics(lineChartPeriods.playerPerformanceLast7Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[6],
		'last30Days': calculateLineChartMetrics(lineChartPeriods.playerPerformanceLast30Days, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[7],
		'last6Months': calculateLineChartMetrics(lineChartPeriods.playerPerformanceLast6Months, athletes, [recovery, cycles], cycles, recoveryMetrics, cycleMetrics, sleepPerformance, sleepStages, sleep)[8],
	}

	const allTimeRecoveryStats = getCycleIds(allTimePeriod, athletes, recovery, cycles, false);
	const allTimeWorkloadStats = getCycleIds(allTimePeriod, athletes, cycles, cycles, false);

	// Group recovery stats by athlete_id
	const allTimeRecoveryMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const recoveryScores = sortedAthleteStats.map(metric =>
			calculateAverage('Recovery', recoveryMetrics, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			recoveryScores: recoveryScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeWorkloadMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeWorkloadStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const workloadScores = sortedAthleteStats.map(metric =>
			calculateAverage('Workload', cycleMetrics, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			workloadScores: workloadScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeRHRMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const rhrScores = sortedAthleteStats.map(metric =>
			calculateAverage('RHR', recoveryMetrics, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			rhrScores: rhrScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeHRVMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const hrvScores = sortedAthleteStats.map(metric =>
			calculateAverage('HRV', recoveryMetrics, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			hrvScores: hrvScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepPerformanceMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepPerformanceScores = sortedAthleteStats.map(metric =>
			calculateAverage('Sleep Performance', sleepPerformance, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepPerformanceScores: sleepPerformanceScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepConsistencyMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepConsistencyScores = sortedAthleteStats.map(metric =>
			calculateAverage('Sleep Consistency', sleepPerformance, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepConsistencyScores: sleepConsistencyScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepEfficiencyMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepEfficiencyScores = sortedAthleteStats.map(metric =>
			calculateAverage('Sleep Efficiency', sleepPerformance, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepEfficiencyScores: sleepEfficiencyScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepDurationMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepDurationScores = sortedAthleteStats.map(metric =>
			calculateAverage('Sleep Duration', sleepStages, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepDurationScores: sleepDurationScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeRestorativeSleepDurationMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const restorativeSleepDurationScores = sortedAthleteStats.map(metric =>
			calculateAverage('Restorative Sleep Duration', sleepStages, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			restorativeSleepDurationScores: restorativeSleepDurationScores,
			// Store the dates to help with matching later
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeRestorativeSleepMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const restorativeSleepScores = sortedAthleteStats.map(metric =>
			calculateAverage('Restorative Sleep', sleepStages, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			restorativeSleepScores: restorativeSleepScores,
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepStartMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepStartScores = sortedAthleteStats.map(metric =>
			getDates('Sleep Start', sleep, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepStartScores: sleepStartScores,
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	const allTimeSleepEndMetrics = athletes.map((athlete: IAthlete) => {
		const athleteStats = allTimeRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id);

		// Map recovery stats to include cycle dates
		const statsWithDates = athleteStats.map(stat => {
			// Find the corresponding cycle to get the date
			const cycle = cycles.find(c => c.cycle_id === stat.cycle_id);
			return {
				...stat,
				cycle_date: cycle ? cycle.cycle_date : ''
			};
		});

		// Sort athlete stats by date to ensure consistent ordering
		const sortedAthleteStats = [...statsWithDates].sort((a, b) => {
			if (!a.cycle_date || !b.cycle_date) return 0;
			const dateA = new Date(a.cycle_date);
			const dateB = new Date(b.cycle_date);
			return dateA.getTime() - dateB.getTime();
		});

		const sleepEndScores = sortedAthleteStats.map(metric =>
			getDates('Sleep End', sleep, [metric])
		);

		return {
			athlete_id: athlete.athlete_id,
			sleepEndScores: sleepEndScores,
			dates: sortedAthleteStats.map(stat => stat.cycle_date)
		};
	});

	interface AthleteMetricResult {
		athlete_id: number;
		three_month_average: number;
		three_month_standard_deviation: number;
		all_time_average: number;
		all_time_standard_deviation: number;
	}

	const calculateMetric3Months = (
		athletes: IAthlete[],
		allTimeData: {
			athlete_id: number;
			dates: string[];
			[key: string]: any;
		}[],
		metricKey: string,
		datePeriod: DateRange
	): AthleteMetricResult[] => {
		return athletes.map((athlete: IAthlete): AthleteMetricResult => {
			const athleteData = allTimeData.find(
				(data) => data.athlete_id === athlete.athlete_id
			);

			if (!athleteData) {
				return {
					athlete_id: athlete.athlete_id,
					three_month_average: 0,
					three_month_standard_deviation: 0,
					all_time_average: 0,
					all_time_standard_deviation: 0
				};
			}

			// Extract the metric values once.
			const metricValues: number[] = athleteData[metricKey];

			// Calculate three-month values for the given date period.
			const startDate = new Date(datePeriod.start);
			const endDate = new Date(datePeriod.end);
			const valuesInDateRange: number[] = [];

			athleteData.dates.forEach((dateStr: string, index: number) => {
				const date = new Date(dateStr);
				if (
					date >= startDate &&
					date <= endDate &&
					metricValues[index] !== undefined &&
					typeof metricValues[index] === 'number'
				) {
					valuesInDateRange.push(metricValues[index]);
				}
			});

			// Calculate three-month average and standard deviation.
			const threeMonthAverage =
				valuesInDateRange.length > 0
					? valuesInDateRange.reduce((sum, value) => sum + value, 0) / valuesInDateRange.length
					: 0;

			let threeMonthStandardDeviation = 0;
			if (valuesInDateRange.length > 0) {
				const squaredDifferences = valuesInDateRange.map((value) => {
					const diff = value - threeMonthAverage;
					return diff * diff;
				});
				const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / valuesInDateRange.length;
				threeMonthStandardDeviation = Math.sqrt(variance);
			}

			// Calculate all-time values (ignoring date filtering).
			const allTimeValues: number[] = [];
			athleteData.dates.forEach((_, index: number) => {
				if (
					metricValues[index] !== undefined &&
					typeof metricValues[index] === 'number'
				) {
					allTimeValues.push(metricValues[index]);
				}
			});

			const allTimeAverage =
				allTimeValues.length > 0
					? allTimeValues.reduce((sum, value) => sum + value, 0) / allTimeValues.length
					: 0;

			let allTimeStandardDeviation = 0;
			if (allTimeValues.length > 0) {
				const squaredDifferences = allTimeValues.map((value) => {
					const diff = value - allTimeAverage;
					return diff * diff;
				});
				const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / allTimeValues.length;
				allTimeStandardDeviation = Math.sqrt(variance);
			}

			return {
				athlete_id: athlete.athlete_id,
				three_month_average: Math.round(threeMonthAverage * 10) / 10,
				three_month_standard_deviation: Math.round(threeMonthStandardDeviation * 10) / 10,
				all_time_average: Math.round(allTimeAverage * 10) / 10,
				all_time_standard_deviation: Math.round(allTimeStandardDeviation * 10) / 10
			};
		});
	};

	const calculateCycleMetric3Months = (
		athletes: IAthlete[],
		datePeriod: DateRange,
		stats: IRecovery[] | ICycle[],
		statType: 'recovery' | 'cycle',
		metrics: IRecoveryMetrics[] | ICycleMetrics[],
		metricKey: string
	) => {
		return athletes.map((athlete: IAthlete) => {
			// Get the stats for the current 3-month period
			const currentStats = getCycleIds(datePeriod, [athlete], stats, cycles, false);

			// Get all time stats by setting a wide date range (from epoch to now)
			const allTimeStats = getCycleIds(
				{
					start: new Date(0).toISOString().split('T')[0],
					end: new Date().toISOString().split('T')[0]
				},
				[athlete],
				stats,
				cycles,
				false
			);

			// Helper function to calculate average and standard deviation from a set of stat items
			const computeMetrics = (statsArray: any[]) => {
				const metricScores: number[] = [];

				statsArray.forEach((statItem) => {
					let statId: number | undefined;
					const idKey = statType === 'recovery' ? 'recovery_id' : 'cycle_id';

					if (statType === 'recovery' && 'recovery_id' in statItem) {
						statId = statItem.recovery_id;
					} else if (statType === 'cycle' && 'cycle_id' in statItem) {
						statId = statItem.cycle_id;
					}

					if (statId !== undefined) {
						const matchingMetrics = metrics.filter((entry: any) => {
							if (idKey in entry) {
								return entry[idKey] === statId;
							}
							return false;
						});

						matchingMetrics.forEach((metric: any) => {
							if (metricKey in metric && typeof metric[metricKey] === 'number') {
								metricScores.push(metric[metricKey]);
							}
						});
					}
				});

				// Calculate the average
				const average =
					metricScores.length > 0
						? metricScores.reduce((sum, value) => sum + value, 0) / metricScores.length
						: 0;

				// Calculate the standard deviation
				let standardDeviation = 0;
				if (metricScores.length > 0) {
					const squaredDifferences = metricScores.map(value => {
						const diff = value - average;
						return diff * diff;
					});
					const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / metricScores.length;
					standardDeviation = Math.sqrt(variance);
				}

				return {
					average: Math.round(average * 10) / 10,
					standard_deviation: Math.round(standardDeviation * 10) / 10
				};
			};

			const threeMonthMetrics = computeMetrics(currentStats);
			const allTimeMetrics = computeMetrics(allTimeStats);

			return {
				athlete_id: athlete.athlete_id,
				three_month_average: threeMonthMetrics.average,
				three_month_standard_deviation: threeMonthMetrics.standard_deviation,
				all_time_average: allTimeMetrics.average,
				all_time_standard_deviation: allTimeMetrics.standard_deviation
			};
		});
	};


	const recoveryMetrics3Months = calculateMetrics(datePeriods.last3Months, athletes, recovery, cycles, recoveryMetrics, cycleMetrics)[0];
	const workloadMetrics3Months = calculateMetrics(datePeriods.last3Months, athletes, recovery, cycles, recoveryMetrics, cycleMetrics)[3];

	// Calculate 3-month metrics for all needed values
	const RHRMetrics3Months = calculateMetric3Months(athletes, allTimeRHRMetrics, 'rhrScores', datePeriods.last3Months);
	const HRVMetrics3Months = calculateMetric3Months(athletes, allTimeHRVMetrics, 'hrvScores', datePeriods.last3Months);
	const SleepPerformanceMetrics3Months = calculateMetric3Months(athletes, allTimeSleepPerformanceMetrics, 'sleepPerformanceScores', datePeriods.last3Months);
	const SleepConsistencyMetrics3Months = calculateMetric3Months(athletes, allTimeSleepConsistencyMetrics, 'sleepConsistencyScores', datePeriods.last3Months);
	const SleepEfficiencyMetrics3Months = calculateMetric3Months(athletes, allTimeSleepEfficiencyMetrics, 'sleepEfficiencyScores', datePeriods.last3Months);
	const SleepDurationMetrics3Months = calculateMetric3Months(athletes, allTimeSleepDurationMetrics, 'sleepDurationScores', datePeriods.last3Months);
	const RestorativeSleepDurationMetrics3Months = calculateMetric3Months(athletes, allTimeRestorativeSleepDurationMetrics, 'restorativeSleepDurationScores', datePeriods.last3Months);
	const RestorativeSleepMetrics3Months = calculateMetric3Months(athletes, allTimeRestorativeSleepMetrics, 'restorativeSleepScores', datePeriods.last3Months);

	// Calculate cycle-specific metrics
	const RecoveryMetricsStdDev3Months = calculateCycleMetric3Months(athletes, datePeriods.last3Months, recovery, 'recovery', recoveryMetrics, 'recovery_score');
	const WorkloadMetricsStdDev3Months = calculateCycleMetric3Months(athletes, datePeriods.last3Months, cycles, 'cycle', cycleMetrics, 'strain');

	const DBRTDowntimeDays = allTimeRecoveryMetrics.reduce((acc, athlete) => {
		return acc + athlete.recoveryScores.filter(score => score < 66).length;
	}, 0);

	const DBRTTotalDays = allTimeRecoveryMetrics.reduce((acc, athlete) => {
		return acc + athlete.recoveryScores.length;
	}, 0);

	const data = parseJsonForDatabase({
		allRecoveryMetrics,
		allRecoveryMetricsAverage,
		allWorkloadMetrics,
		allWorkloadMetricsAverage,
		allHomepageLineChartRecoveryMetrics,
		allPlayerPageLineChartRecoveryMetrics,
		allPerformancePageLineChartRecoveryMetrics,
		allTimeRecoveryStats,
		allTimeWorkloadStats,
		allTimeRecoveryMetrics,
		allTimeWorkloadMetrics,
		allTimeRHRMetrics,
		allTimeHRVMetrics,
		allTimeSleepPerformanceMetrics,
		allTimeSleepConsistencyMetrics,
		allTimeSleepEfficiencyMetrics,
		allTimeSleepDurationMetrics,
		allTimeRestorativeSleepDurationMetrics,
		allTimeRestorativeSleepMetrics,
		allTimeSleepStartMetrics,
		allTimeSleepEndMetrics,
		recoverySquadAvailability,
		// Add 3-month metrics for alert system
		RecoveryMetricsStdDev3Months,
		WorkloadMetricsStdDev3Months,
		RHRMetrics3Months,
		HRVMetrics3Months,
		SleepPerformanceMetrics3Months,
		SleepConsistencyMetrics3Months,
		SleepEfficiencyMetrics3Months,
		SleepDurationMetrics3Months,
		RestorativeSleepDurationMetrics3Months,
		RestorativeSleepMetrics3Months,
		dbrt: {
			downtime_days: DBRTDowntimeDays,
			total_days: DBRTTotalDays
		}
	});
	await insertDataIntoSupabase(supabase, data);

	return NextResponse.json({ data }, { status: 200 });
}
const calculateValildRecovery = (timePeriod: DateRange, athletes: IAthlete[], recovery: IRecovery[], cycles: ICycle[], recoveryMetrics: IRecoveryMetrics[], cycleMetrics: ICycleMetrics[]) => {
	const currentRecoveryStats = getCycleIds(timePeriod, athletes, recovery, cycles, false);
	const previousRecoveryStats = getCycleIds(timePeriod, athletes, recovery, cycles, true);


	const athletesValidRecoveryMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateValidAthleteRecovery(recoveryMetrics, currentRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	const previousAthletesValidRecoveryMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateValidAthleteRecovery(recoveryMetrics, previousRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	return [athletesValidRecoveryMetric, previousAthletesValidRecoveryMetric];
}
const calculateMetrics = (timePeriod: DateRange, athletes: IAthlete[], recovery: IRecovery[], cycles: ICycle[], recoveryMetrics: IRecoveryMetrics[], cycleMetrics: ICycleMetrics[]) => {
	const currentRecoveryStats = getCycleIds(timePeriod, athletes, recovery, cycles, false);
	const previousRecoveryStats = getCycleIds(timePeriod, athletes, recovery, cycles, true);
	const currentWorkloadStats = getCycleIds(timePeriod, athletes, cycles, cycles, false);
	const previousWorkloadStats = getCycleIds(timePeriod, athletes, cycles, cycles, true);

	const periodRecoveryStats = currentRecoveryStats;
	const previousPeriodRecoveryStats = previousRecoveryStats;
	const periodWorkloadStats = currentWorkloadStats;
	const previousPeriodWorkloadStats = previousWorkloadStats;

	const athletesRecoveryMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateAverage('Recovery', recoveryMetrics, periodRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	const athletesPreviousRecoveryMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateAverage('Recovery', recoveryMetrics, previousPeriodRecoveryStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	const athletesRecoveryDifference = athletes.map((athlete: IAthlete) => {
		const currentMetric = athletesRecoveryMetric.find(metric => metric[athlete.athlete_id]);
		const previousMetric = athletesPreviousRecoveryMetric.find(metric => metric[athlete.athlete_id]);
		const difference = (currentMetric ? currentMetric[athlete.athlete_id] : 0) - (previousMetric ? previousMetric[athlete.athlete_id] : 0);
		return { [athlete.athlete_id]: difference };
	});

	const athletesWorkloadMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateAverage('Workload', cycleMetrics, periodWorkloadStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	const athletesPreviousWorkloadMetric = athletes.map((athlete: IAthlete) => {
		const curr = calculateAverage('Workload', cycleMetrics, previousPeriodWorkloadStats.filter(stat => stat.athlete_id === athlete.athlete_id));
		return { [athlete.athlete_id]: curr };
	});

	const athletesWorkloadDifference = athletes.map((athlete: IAthlete) => {
		const currentMetric = athletesWorkloadMetric.find(metric => metric[athlete.athlete_id]);
		const previousMetric = athletesPreviousWorkloadMetric.find(metric => metric[athlete.athlete_id]);
		const difference = (currentMetric ? currentMetric[athlete.athlete_id] : 0) - (previousMetric ? previousMetric[athlete.athlete_id] : 0);
		return { [athlete.athlete_id]: difference };
	});

	return [athletesRecoveryMetric, athletesPreviousRecoveryMetric, athletesRecoveryDifference, athletesWorkloadMetric, athletesPreviousWorkloadMetric, athletesWorkloadDifference];
}

const calculateLineChartMetrics = (timePeriod: DateRange[], athletes: IAthlete[], stats: [IRecovery[], ICycle[]] | undefined, cycles: ICycle[], recoveryMetrics: IRecoveryMetrics[], cycleMetrics: ICycleMetrics[], sleepMetrics: ISleepPerformance[], sleepStagesMetrics: ISleepStages[], sleep: ISleep[]) => {
	const lineChartStatsData = useLinechartStatsData(timePeriod, athletes, stats, cycles);

	const recoveryAverages = lineChartStatsData.lineChartRecoveryStats.map(periodStats =>
		calculateAverage('Recovery', recoveryMetrics, periodStats)
	);

	const workloadAverages = lineChartStatsData.lineChartWorkloadStats.map(periodStats =>
		calculateAverage('Workload', cycleMetrics, periodStats)
	);

	const chartTodayMetrics = lineChartXAxisData.homepageToday.map((name, index) => ({
		name,
		recovery: [...recoveryAverages].reverse()[index] || null,
		workload: Math.round(([...workloadAverages].reverse()[index] || 0) * (100 / 21)) || null
	}));

	const chartLast7DaysMetrics = lineChartXAxisData.homepageLast7Days.map((name, index) => ({
		name,
		recovery: [...recoveryAverages].reverse()[index] || null,
		workload: Math.round(([...workloadAverages].reverse()[index] || 0) * (100 / 21)) || null
	}));

	const chartLast30DaysMetrics = lineChartXAxisData.homepageLast30Days.map((name, index) => ({
		name,
		recovery: [...recoveryAverages].reverse()[index] || null,
		workload: Math.round(([...workloadAverages].reverse()[index] || 0) * (100 / 21)) || null
	}));

	const athletesChartTodayMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		// Format data to match chartTodayMetrics structure
		const athleteData = lineChartXAxisData.homepageToday.map((name, index) => ({
			name,
			recovery: [...currRecovery].reverse()[index] || null,
			workload: Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	const athletesChartLast7DaysMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		// Format data to match chartTodayMetrics structure
		const athleteData = lineChartXAxisData.homepageLast7Days.map((name, index) => ({
			name,
			recovery: [...currRecovery].reverse()[index] || null,
			workload: Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	const athletesChartLast30DaysMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		// Format data to match chartTodayMetrics structure	
		const athleteData = lineChartXAxisData.homepageLast30Days.map((name, index) => ({
			name,
			recovery: [...currRecovery].reverse()[index] || null,
			workload: Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	const athletesChartLast7DaysPerformanceMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		const currRHR = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('RHR', recoveryMetrics, periodStats));

		const currHRV = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('HRV', recoveryMetrics, periodStats));

		const currSleepPerformance = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Performance', sleepMetrics, periodStats));

		const currSleepConsistency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Consistency', sleepMetrics, periodStats));

		const currSleepEfficiency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Efficiency', sleepMetrics, periodStats));

		const currSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleep = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep', sleepStagesMetrics, periodStats));

		const currSleepStart = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep Start', sleep, periodStats));

		const currSleepEnd = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep End', sleep, periodStats));

		const athleteData = lineChartXAxisData.performancePageLast7Days.map((name, index) => ({
			name,
			'Recovery Score': [...currRecovery].reverse()[index] || null,
			'Strain': Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null,
			'RHR': [...currRHR].reverse()[index] || null,
			'HRV': [...currHRV].reverse()[index] || null,
			'Sleep Performance %': [...currSleepPerformance].reverse()[index] || null,
			'Sleep Consistency %': [...currSleepConsistency].reverse()[index] || null,
			'Sleep Efficiency %': [...currSleepEfficiency].reverse()[index] || null,
			'Sleep Duration (hours)': Number(((([...currSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep Duration (hours)': Number(((([...currRestorativeSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep %': [...currRestorativeSleep].reverse()[index] || null,
			'Sleep Start': [...currSleepStart].reverse()[index] || null,
			'Sleep End': [...currSleepEnd].reverse()[index] || null,
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	const athletesChartLast30DaysPerformanceMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		const currRHR = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('RHR', recoveryMetrics, periodStats));

		const currHRV = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('HRV', recoveryMetrics, periodStats));

		const currSleepPerformance = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Performance', sleepMetrics, periodStats));

		const currSleepConsistency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Consistency', sleepMetrics, periodStats));

		const currSleepEfficiency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Efficiency', sleepMetrics, periodStats));

		const currSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleep = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep', sleepStagesMetrics, periodStats));

		const currSleepStart = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep Start', sleep, periodStats));

		const currSleepEnd = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep End', sleep, periodStats));

		const athleteData = lineChartXAxisData.performancePageLast30Days.map((name, index) => ({
			name,
			'Recovery Score': [...currRecovery].reverse()[index] || null,
			'Strain': Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null,
			'RHR': [...currRHR].reverse()[index] || null,
			'HRV': [...currHRV].reverse()[index] || null,
			'Sleep Performance %': [...currSleepPerformance].reverse()[index] || null,
			'Sleep Consistency %': [...currSleepConsistency].reverse()[index] || null,
			'Sleep Efficiency %': [...currSleepEfficiency].reverse()[index] || null,
			'Sleep Duration (hours)': Number(((([...currSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep Duration (hours)': Number(((([...currRestorativeSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep %': [...currRestorativeSleep].reverse()[index] || null,
			'Sleep Start': [...currSleepStart].reverse()[index] || null,
			'Sleep End': [...currSleepEnd].reverse()[index] || null,
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	const athletesChartLast6MonthsPerformanceMetrics = athletes.map((athlete: IAthlete) => {
		const currRecovery = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Recovery', recoveryMetrics, periodStats));

		const currWorkload = lineChartStatsData.lineChartWorkloadStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Workload', cycleMetrics, periodStats));

		const currRHR = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('RHR', recoveryMetrics, periodStats));

		const currHRV = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('HRV', recoveryMetrics, periodStats));

		const currSleepPerformance = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Performance', sleepMetrics, periodStats));

		const currSleepConsistency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Consistency', sleepMetrics, periodStats));

		const currSleepEfficiency = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Efficiency', sleepMetrics, periodStats));

		const currSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleepDuration = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep Duration', sleepStagesMetrics, periodStats));

		const currRestorativeSleep = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => calculateAverage('Restorative Sleep', sleepStagesMetrics, periodStats));

		const currSleepStart = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep Start', sleep, periodStats));

		const currSleepEnd = lineChartStatsData.lineChartRecoveryStats
			.map(periodStats => periodStats.filter(metric => metric.athlete_id === athlete.athlete_id))
			.map(periodStats => getDates('Sleep End', sleep, periodStats));

		const athleteData = lineChartXAxisData.performancePageLast6Months.map((name, index) => ({
			name,
			'Recovery Score': [...currRecovery].reverse()[index] || null,
			'Strain': Math.round(([...currWorkload].reverse()[index] || 0) * (100 / 21)) || null,
			'RHR': [...currRHR].reverse()[index] || null,
			'HRV': [...currHRV].reverse()[index] || null,
			'Sleep Performance %': [...currSleepPerformance].reverse()[index] || null,
			'Sleep Consistency %': [...currSleepConsistency].reverse()[index] || null,
			'Sleep Efficiency %': [...currSleepEfficiency].reverse()[index] || null,
			'Sleep Duration (hours)': Number(((([...currSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep Duration (hours)': Number(((([...currRestorativeSleepDuration].reverse()[index] || 0) / (60 * 60 * 1000))).toFixed(2)) || null,
			'Restorative Sleep %': [...currRestorativeSleep].reverse()[index] || null,
			'Sleep Start': [...currSleepStart].reverse()[index] || null,
			'Sleep End': [...currSleepEnd].reverse()[index] || null,
		}));

		return { [athlete.athlete_id]: athleteData };
	});

	return [chartTodayMetrics, chartLast7DaysMetrics, chartLast30DaysMetrics, athletesChartTodayMetrics, athletesChartLast7DaysMetrics, athletesChartLast30DaysMetrics, athletesChartLast7DaysPerformanceMetrics, athletesChartLast30DaysPerformanceMetrics, athletesChartLast6MonthsPerformanceMetrics
	];
}

const getCycleIds = (
	dateRange: DateRange,
	athletes: IAthlete[],
	stats: IRecovery[] | ICycle[] | undefined,
	cycles: ICycle[],
	previousPeriod: boolean = false
): (IRecovery | ICycle)[] => {

	// Early return if required data is missing
	if (!dateRange || !athletes || !stats || !cycles) {
		return [];
	}

	let extracted_stats: (IRecovery | ICycle)[] = [];

	const range = {
		start: new Date(dateRange.start),
		end: new Date(dateRange.end)
	};

	if (previousPeriod) {
		const duration = range.end.getTime() - range.start.getTime();
		range.end = new Date(range.start.getTime() - 1);
		range.start = new Date(range.start.getTime() - duration - 1);
	}

	athletes.forEach(athlete => {
		const cycleIds = cycles
			.filter(cycle => {
				const cycleDate = new Date(cycle.cycle_date);
				const cycleDateStr = cycleDate.toISOString().split('T')[0];
				const startDateStr = range.start.toISOString().split('T')[0];
				const endDateStr = range.end.toISOString().split('T')[0];

				return cycleDateStr >= startDateStr &&
					cycleDateStr <= endDateStr &&
					cycle.athlete_id === athlete.athlete_id;
			})
			.map(cycle => cycle.cycle_id);

		const athleteStats = stats.filter((stat: IRecovery | ICycle) =>
			stat.athlete_id === athlete.athlete_id &&
			cycleIds.includes(stat.cycle_id)
		);

		extracted_stats = extracted_stats.concat(athleteStats);
	});
	// }

	return extracted_stats;
};

const calculateAverage = (
	title: string,
	metrics: (IRecoveryMetrics | ICycleMetrics | ISleepPerformance | ISleepStages | ISleep)[],
	stats: (IRecovery | ICycle)[]
): number => {
	let data: (IRecoveryMetrics | ICycleMetrics | ISleepPerformance | ISleepStages | ISleep)[] = [];
	let avg = 0;

	// Handle Recovery metrics calculation
	if (title === 'Recovery') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is IRecoveryMetrics =>
				'recovery_id' in entry && 'recovery_id' in statItem &&
				entry.recovery_id === statItem.recovery_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('recovery_score' in entry) {
				return sum + entry.recovery_score;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Handle Workload metrics calculation
	else if (title === 'Workload') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ICycleMetrics =>
				'cycle_id' in entry && 'cycle_id' in statItem &&
				entry.cycle_id === statItem.cycle_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('strain' in entry) {
				return sum + entry.strain;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Handle Fitness Score calculation
	else if (title === 'Fitness') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is IRecoveryMetrics =>
				'recovery_id' in statItem && 'recovery_id' in entry &&
				entry.recovery_id === (statItem as IRecovery).recovery_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('recovery_score' in entry) {
				return sum + entry.recovery_score;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Handle HRV calculation
	else if (title === 'HRV') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is IRecoveryMetrics =>
				'recovery_id' in statItem && 'recovery_id' in entry &&
				entry.recovery_id === (statItem as IRecovery).recovery_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('hrv_rmssd_milli' in entry) {
				return sum + entry.hrv_rmssd_milli;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Handle RHR calculation
	else if (title === 'RHR') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is IRecoveryMetrics =>
				'recovery_id' in statItem && 'recovery_id' in entry &&
				entry.recovery_id === (statItem as IRecovery).recovery_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('resting_heart_rate' in entry) {
				return sum + entry.resting_heart_rate;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Sleep Performance calculation
	else if (title === 'Sleep Performance') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepPerformance =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('sleep_performance_percentage' in entry) {
				return sum + entry.sleep_performance_percentage;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Sleep Consistency calculation
	else if (title === 'Sleep Consistency') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepPerformance =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('sleep_consistency_percentage' in entry) {
				return sum + entry.sleep_consistency_percentage;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Sleep Efficiency calculation
	else if (title === 'Sleep Efficiency') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepPerformance =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('sleep_efficiency_percentage' in entry) {
				return sum + entry.sleep_efficiency_percentage;
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Sleep Duration calculation
	else if (title === 'Sleep Duration') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepStages =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('total_in_bed_time_milli' in entry && 'total_awake_time_milli' in entry) {
				return sum + (entry.total_in_bed_time_milli - entry.total_awake_time_milli);
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Restorative Sleep Duration calculation
	else if (title === 'Restorative Sleep Duration') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepStages =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('total_slow_wave_sleep_time_milli' in entry && 'total_rem_sleep_time_milli' in entry) {
				return sum + (entry.total_slow_wave_sleep_time_milli + entry.total_rem_sleep_time_milli);
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	// Restorative Sleep calculation
	else if (title === 'Restorative Sleep') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleepStages =>
				'sleep_id' in statItem && 'sleep_id' in entry &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		const total = data.reduce((sum, entry) => {
			if ('total_slow_wave_sleep_time_milli' in entry && 'total_rem_sleep_time_milli' in entry && 'total_in_bed_time_milli' in entry) {
				return sum + (((entry.total_slow_wave_sleep_time_milli + entry.total_rem_sleep_time_milli) / entry.total_in_bed_time_milli) * 100);
			}
			return sum;
		}, 0);

		avg = data.length > 0 ? Math.round(total / data.length) : 0;
	}
	return avg;
};
const calculateValidAthleteRecovery = (metrics: (IRecoveryMetrics | ICycleMetrics | ISleepPerformance | ISleepStages | ISleep)[],
	stats: (IRecovery | ICycle)[]) => {

	let data: (IRecoveryMetrics | ICycleMetrics | ISleepPerformance | ISleepStages | ISleep)[] = [];

	stats.forEach((statItem) => {
		const matchingMetrics = metrics.filter((entry): entry is IRecoveryMetrics =>
			'recovery_id' in entry && 'recovery_id' in statItem &&
			entry.recovery_id === statItem.recovery_id
		);
		data = data.concat(matchingMetrics);
	});
	let total = 0;
	data.forEach((entry) => {
		if ('recovery_score' in entry && entry.recovery_score > VALID_RECOVERY_THRESHOLD) {
			total++;
		}
	});
	return total;
}
/**
 * Gets sleep start or end dates from sleep metrics based on the title parameter
 * @param title - The type of date to retrieve ('Sleep Start' or 'Sleep End')
 * @param metrics - Array of sleep metrics containing sleep start/end times
 * @param stats - Array of recovery or cycle stats to match with sleep metrics
 * @returns The sleep start or end date as a string, or empty string if not found
 */
const getDates = (
	title: string,
	metrics: (ISleep)[],
	stats: (IRecovery | ICycle)[]
): string => {
	let data: (ISleep)[] = [];
	let date: string = '';

	// Get Sleep Start
	if (title === 'Sleep Start') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleep =>
				'sleep_id' in entry && 'sleep_id' in statItem &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		data.forEach((entry) => {
			if ('sleep_start' in entry) {
				date = entry.sleep_start;
			}
		});
	}
	// Get Sleep End
	else if (title === 'Sleep End') {
		stats.forEach((statItem) => {
			const matchingMetrics = metrics.filter((entry): entry is ISleep =>
				'sleep_id' in entry && 'sleep_id' in statItem &&
				entry.sleep_id === statItem.sleep_id
			);
			data = data.concat(matchingMetrics);
		});

		data.forEach((entry) => {
			if ('sleep_end' in entry) {
				date = entry.sleep_end;
			}
		});
	}

	return date;
}

function useLinechartStatsData(timePeriod: DateRange[], athletes: IAthlete[], stats: [IRecovery[], ICycle[]] | undefined, cycles: ICycle[]) {
	const lastValidDate = timePeriod?.[timePeriod.length - 1] || {
		start: new Date().toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0]
	};

	// Recovery hooks - always call these hooks
	const recovery0 = getCycleIds(timePeriod?.[0] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery1 = getCycleIds(timePeriod?.[1] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery2 = getCycleIds(timePeriod?.[2] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery3 = getCycleIds(timePeriod?.[3] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery4 = getCycleIds(timePeriod?.[4] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery5 = getCycleIds(timePeriod?.[5] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery6 = getCycleIds(timePeriod?.[6] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery7 = getCycleIds(timePeriod?.[7] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery8 = getCycleIds(timePeriod?.[8] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery9 = getCycleIds(timePeriod?.[9] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery10 = getCycleIds(timePeriod?.[10] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery11 = getCycleIds(timePeriod?.[11] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery12 = getCycleIds(timePeriod?.[12] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery13 = getCycleIds(timePeriod?.[13] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery14 = getCycleIds(timePeriod?.[14] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery15 = getCycleIds(timePeriod?.[15] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery16 = getCycleIds(timePeriod?.[16] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery17 = getCycleIds(timePeriod?.[17] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery18 = getCycleIds(timePeriod?.[18] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery19 = getCycleIds(timePeriod?.[19] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery20 = getCycleIds(timePeriod?.[20] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery21 = getCycleIds(timePeriod?.[21] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery22 = getCycleIds(timePeriod?.[22] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery23 = getCycleIds(timePeriod?.[23] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery24 = getCycleIds(timePeriod?.[24] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery25 = getCycleIds(timePeriod?.[25] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery26 = getCycleIds(timePeriod?.[26] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery27 = getCycleIds(timePeriod?.[27] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery28 = getCycleIds(timePeriod?.[28] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);
	const recovery29 = getCycleIds(timePeriod?.[29] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], false);

	// Workload hooks - always call these hooks
	const workload0 = getCycleIds(timePeriod?.[0] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload1 = getCycleIds(timePeriod?.[1] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload2 = getCycleIds(timePeriod?.[2] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload3 = getCycleIds(timePeriod?.[3] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload4 = getCycleIds(timePeriod?.[4] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload5 = getCycleIds(timePeriod?.[5] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload6 = getCycleIds(timePeriod?.[6] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload7 = getCycleIds(timePeriod?.[7] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload8 = getCycleIds(timePeriod?.[8] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload9 = getCycleIds(timePeriod?.[9] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload10 = getCycleIds(timePeriod?.[10] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload11 = getCycleIds(timePeriod?.[11] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload12 = getCycleIds(timePeriod?.[12] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload13 = getCycleIds(timePeriod?.[13] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload14 = getCycleIds(timePeriod?.[14] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload15 = getCycleIds(timePeriod?.[15] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload16 = getCycleIds(timePeriod?.[16] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload17 = getCycleIds(timePeriod?.[17] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload18 = getCycleIds(timePeriod?.[18] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload19 = getCycleIds(timePeriod?.[19] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload20 = getCycleIds(timePeriod?.[20] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload21 = getCycleIds(timePeriod?.[21] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload22 = getCycleIds(timePeriod?.[22] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload23 = getCycleIds(timePeriod?.[23] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload24 = getCycleIds(timePeriod?.[24] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload25 = getCycleIds(timePeriod?.[25] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload26 = getCycleIds(timePeriod?.[26] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload27 = getCycleIds(timePeriod?.[27] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload28 = getCycleIds(timePeriod?.[28] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);
	const workload29 = getCycleIds(timePeriod?.[29] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], false);

	// Previous period hooks
	const prevRecovery0 = getCycleIds(timePeriod?.[0] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery1 = getCycleIds(timePeriod?.[1] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery2 = getCycleIds(timePeriod?.[2] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery3 = getCycleIds(timePeriod?.[3] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery4 = getCycleIds(timePeriod?.[4] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery5 = getCycleIds(timePeriod?.[5] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery6 = getCycleIds(timePeriod?.[6] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery7 = getCycleIds(timePeriod?.[7] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery8 = getCycleIds(timePeriod?.[8] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery9 = getCycleIds(timePeriod?.[9] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery10 = getCycleIds(timePeriod?.[10] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery11 = getCycleIds(timePeriod?.[11] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery12 = getCycleIds(timePeriod?.[12] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery13 = getCycleIds(timePeriod?.[13] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery14 = getCycleIds(timePeriod?.[14] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery15 = getCycleIds(timePeriod?.[15] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery16 = getCycleIds(timePeriod?.[16] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery17 = getCycleIds(timePeriod?.[17] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery18 = getCycleIds(timePeriod?.[18] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery19 = getCycleIds(timePeriod?.[19] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery20 = getCycleIds(timePeriod?.[20] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery21 = getCycleIds(timePeriod?.[21] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery22 = getCycleIds(timePeriod?.[22] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery23 = getCycleIds(timePeriod?.[23] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery24 = getCycleIds(timePeriod?.[24] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery25 = getCycleIds(timePeriod?.[25] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery26 = getCycleIds(timePeriod?.[26] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery27 = getCycleIds(timePeriod?.[27] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery28 = getCycleIds(timePeriod?.[28] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);
	const prevRecovery29 = getCycleIds(timePeriod?.[29] || lastValidDate, athletes || [], stats?.[0] || [], cycles || [], true);

	const prevWorkload0 = getCycleIds(timePeriod?.[0] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload1 = getCycleIds(timePeriod?.[1] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload2 = getCycleIds(timePeriod?.[2] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload3 = getCycleIds(timePeriod?.[3] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload4 = getCycleIds(timePeriod?.[4] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload5 = getCycleIds(timePeriod?.[5] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload6 = getCycleIds(timePeriod?.[6] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload7 = getCycleIds(timePeriod?.[7] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload8 = getCycleIds(timePeriod?.[8] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload9 = getCycleIds(timePeriod?.[9] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload10 = getCycleIds(timePeriod?.[10] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload11 = getCycleIds(timePeriod?.[11] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload12 = getCycleIds(timePeriod?.[12] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload13 = getCycleIds(timePeriod?.[13] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload14 = getCycleIds(timePeriod?.[14] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload15 = getCycleIds(timePeriod?.[15] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload16 = getCycleIds(timePeriod?.[16] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload17 = getCycleIds(timePeriod?.[17] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload18 = getCycleIds(timePeriod?.[18] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload19 = getCycleIds(timePeriod?.[19] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload20 = getCycleIds(timePeriod?.[20] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload21 = getCycleIds(timePeriod?.[21] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload22 = getCycleIds(timePeriod?.[22] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload23 = getCycleIds(timePeriod?.[23] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload24 = getCycleIds(timePeriod?.[24] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload25 = getCycleIds(timePeriod?.[25] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload26 = getCycleIds(timePeriod?.[26] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload27 = getCycleIds(timePeriod?.[27] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload28 = getCycleIds(timePeriod?.[28] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);
	const prevWorkload29 = getCycleIds(timePeriod?.[29] || lastValidDate, athletes || [], stats?.[1] || [], cycles || [], true);

	// Guard clause for return value
	if (!timePeriod || !athletes || !stats || !cycles) {
		return {
			lineChartRecoveryStats: [],
			lineChartWorkloadStats: [],
			previousLineChartRecoveryStats: [],
			previousLineChartWorkloadStats: [],

		};
	}

	const recoveryStats = [
		recovery0, recovery1, recovery2, recovery3, recovery4, recovery5, recovery6, recovery7, recovery8, recovery9,
		recovery10, recovery11, recovery12, recovery13, recovery14, recovery15, recovery16, recovery17, recovery18, recovery19,
		recovery20, recovery21, recovery22, recovery23, recovery24, recovery25, recovery26, recovery27, recovery28, recovery29
	];

	const workloadStats = [
		workload0, workload1, workload2, workload3, workload4, workload5, workload6, workload7, workload8, workload9,
		workload10, workload11, workload12, workload13, workload14, workload15, workload16, workload17, workload18, workload19,
		workload20, workload21, workload22, workload23, workload24, workload25, workload26, workload27, workload28, workload29
	];

	const prevRecoveryStats = [
		prevRecovery0, prevRecovery1, prevRecovery2, prevRecovery3, prevRecovery4, prevRecovery5, prevRecovery6, prevRecovery7, prevRecovery8, prevRecovery9,
		prevRecovery10, prevRecovery11, prevRecovery12, prevRecovery13, prevRecovery14, prevRecovery15, prevRecovery16, prevRecovery17, prevRecovery18, prevRecovery19,
		prevRecovery20, prevRecovery21, prevRecovery22, prevRecovery23, prevRecovery24, prevRecovery25, prevRecovery26, prevRecovery27, prevRecovery28, prevRecovery29
	];

	const prevWorkloadStats = [
		prevWorkload0, prevWorkload1, prevWorkload2, prevWorkload3, prevWorkload4, prevWorkload5, prevWorkload6, prevWorkload7, prevWorkload8, prevWorkload9,
		prevWorkload10, prevWorkload11, prevWorkload12, prevWorkload13, prevWorkload14, prevWorkload15, prevWorkload16, prevWorkload17, prevWorkload18, prevWorkload19,
		prevWorkload20, prevWorkload21, prevWorkload22, prevWorkload23, prevWorkload24, prevWorkload25, prevWorkload26, prevWorkload27, prevWorkload28, prevWorkload29
	];

	return {
		lineChartRecoveryStats: recoveryStats.slice(0, timePeriod.length),
		lineChartWorkloadStats: workloadStats.slice(0, timePeriod.length),
		previousLineChartRecoveryStats: prevRecoveryStats.slice(0, timePeriod.length),
		previousLineChartWorkloadStats: prevWorkloadStats.slice(0, timePeriod.length)
	};
}

const calculateAverageFromMetrics = (metrics: { [key: string]: number }[], difference: boolean) => {
	if (!metrics || metrics.length === 0) return 0;

	const values = metrics.map(curr => Object.values(curr)[0]);

	if (difference) {
		// Include zeros when calculating differences
		const sum = values.reduce((acc, value) => acc + value, 0);
		return Math.round(sum / values.length);
	} else {
		// Exclude zeros for regular metrics
		const nonZeroValues = values.filter(value => value !== 0);
		if (nonZeroValues.length === 0) return 0;
		const sum = nonZeroValues.reduce((acc, value) => acc + value, 0);
		return Math.round(sum / nonZeroValues.length);
	}
};

interface RecoveryMetric {
	athlete_id: number;
	team_id: number;
	period: string;
	value: number;
}

interface RecoveryMetricAverage {
	period: string;
	team_id: number;
	average: number;
}

interface WorkloadMetric {
	athlete_id: number;
	team_id: number;
	period: string;
	value: number;
}

interface WorkloadMetricAverage {
	period: string;
	team_id: number;
	average: number;
}

interface PlayerLineChartMetric {
	athlete_id: number;
	team_id: number;
	time_window: string;
	label: string;
	recovery: number | null;
	workload: number | null;
}

interface PerformanceLineChartMetric {
	athlete_id: number;
	team_id: number;
	time_window: string;
	label: string;
	recovery_score: number | null;
	strain: number | null;
	rhr: number | null;
	hrv: number | null;
	sleep_performance: number | null;
	sleep_consistency: number | null;
	sleep_efficiency: number | null;
	sleep_duration: number | null;
	restorative_sleep_duration: number | null;
	restorative_sleep: number | null;
	sleep_start: string | null;
	sleep_end: string | null;
}

interface HomepageLineChartMetric {
	time_window: string;
	label: string;
	team_id: number;
	recovery: number | null;
	workload: number | null;
}

interface AllTimeMetric {
	athlete_id: number;
	team_id: number;
	label: Date;
	recovery_score: number | null;
	strain: number | null;
	rhr: number | null;
	hrv: number | null;
	sleep_performance: number | null;
	sleep_consistency: number | null;
	sleep_efficiency: number | null;
	sleep_duration: number | null;
	restorative_sleep_duration: number | null;
	restorative_sleep: number | null;
	sleep_start: string | null;
	sleep_end: string | null;
}

interface AllTimeMetricAverage {
	athlete_id: number;
	team_id: number;
	recovery_score_avg: number | null;
	strain_avg: number | null;
	rhr_avg: number | null;
	hrv_avg: number | null;
	sleep_performance_avg: number | null;
	sleep_consistency_avg: number | null;
	sleep_efficiency_avg: number | null;
	sleep_duration_avg: number | null;
	restorative_sleep_duration_avg: number | null;
	restorative_sleep_avg: number | null;
}
interface RecoverySquadAvailability {
	athlete_id: number;
	team_id: number;
	period: 'today' | 'previousDay' | 'last7Days' | 'previous7Days' | 'last30Days' | 'previous30Days';
	value: number;
}

interface RHRMetric3Month {
	athlete_id: number;
	average: number;
	standard_deviation: number;
}

interface RecoveryMetric3Month {
	athlete_id: number;
	average: number;
	standard_deviation: number;
}

interface RestorativeSleepMetric3Month {
	athlete_id: number;
	average: number;
	standard_deviation: number;
}

interface DatabaseTables {
	recovery_metrics: RecoveryMetric[];
	recovery_metrics_average: RecoveryMetricAverage[];
	workload_metrics: WorkloadMetric[];
	workload_metrics_average: WorkloadMetricAverage[];
	player_line_chart_metrics: PlayerLineChartMetric[];
	performance_line_chart_metrics: PerformanceLineChartMetric[];
	all_time_metrics: AllTimeMetric[];
	all_time_metrics_averages: AllTimeMetricAverage[];
	homepage_line_chart_metrics: HomepageLineChartMetric[];
	recovery_squad_availability: RecoverySquadAvailability[];
	dbrt: {
		downtime_days: number;
		total_days: number;
	};
	alert_system_metrics: {
		athlete_id: number;
		recovery_score_three_month_avg: number;
		recovery_score_three_month_std_dev: number;
		recovery_score_all_time_avg: number;
		recovery_score_all_time_std_dev: number;
		strain_three_month_avg: number;
		strain_three_month_std_dev: number;
		strain_all_time_avg: number;
		strain_all_time_std_dev: number;
		rhr_three_month_avg: number;
		rhr_three_month_std_dev: number;
		rhr_all_time_avg: number;
		rhr_all_time_std_dev: number;
		hrv_three_month_avg: number;
		hrv_three_month_std_dev: number;
		hrv_all_time_avg: number;
		hrv_all_time_std_dev: number;
		sleep_performance_three_month_avg: number;
		sleep_performance_three_month_std_dev: number;
		sleep_performance_all_time_avg: number;
		sleep_performance_all_time_std_dev: number;
		sleep_consistency_three_month_avg: number;
		sleep_consistency_three_month_std_dev: number;
		sleep_consistency_all_time_avg: number;
		sleep_consistency_all_time_std_dev: number;
		sleep_efficiency_three_month_avg: number;
		sleep_efficiency_three_month_std_dev: number;
		sleep_efficiency_all_time_avg: number;
		sleep_efficiency_all_time_std_dev: number;
		sleep_duration_three_month_avg: number;
		sleep_duration_three_month_std_dev: number;
		sleep_duration_all_time_avg: number;
		sleep_duration_all_time_std_dev: number;
		restorative_sleep_duration_three_month_avg: number;
		restorative_sleep_duration_three_month_std_dev: number;
		restorative_sleep_duration_all_time_avg: number;
		restorative_sleep_duration_all_time_std_dev: number;
		restorative_sleep_three_month_avg: number;
		restorative_sleep_three_month_std_dev: number;
		restorative_sleep_all_time_avg: number;
		restorative_sleep_all_time_std_dev: number;
	}[];
}

function parseJsonForDatabase(jsonData: any): DatabaseTables {
	const result: DatabaseTables = {
		recovery_metrics: [],
		recovery_metrics_average: [],
		workload_metrics: [],
		workload_metrics_average: [],
		player_line_chart_metrics: [],
		performance_line_chart_metrics: [],
		all_time_metrics: [],
		all_time_metrics_averages: [],
		homepage_line_chart_metrics: [],
		recovery_squad_availability: [],
		dbrt: {
			downtime_days: 0,
			total_days: 0
		},
		alert_system_metrics: [],
	};

	// Parse recovery metrics
	const recoveryPeriods = ['today', 'previousDay', 'todayDifference', 'last7Days', 'previous7Days', 'last7DaysDifference', 'last30Days', 'previous30Days', 'last30DaysDifference'];
	recoveryPeriods.forEach(period => {
		if (jsonData.allRecoveryMetrics[period]) {
			jsonData.allRecoveryMetrics[period].forEach((item: any) => {
				const athleteId = parseInt(Object.keys(item)[0]);
				result.recovery_metrics.push({
					athlete_id: athleteId,
					team_id: 1, // Set default team_id to 1
					period: period,
					value: item[athleteId]
				});
			});
		}
	});

	// Parse recovery metrics average
	const recoveryAveragePeriods = ['today', 'todayDifference', 'last7Days', 'last7DaysDifference', 'last30Days', 'last30DaysDifference'];
	recoveryAveragePeriods.forEach(period => {
		if (jsonData.allRecoveryMetricsAverage[period] !== undefined) {
			result.recovery_metrics_average.push({
				period: period,
				team_id: 1, // Set default team_id to 1
				average: jsonData.allRecoveryMetricsAverage[period]
			});
		}
	});

	// Parse workload metrics
	const workloadPeriods = ['today', 'previousDay', 'todayDifference', 'last7Days', 'previous7Days', 'last7DaysDifference', 'last30Days', 'previous30Days', 'last30DaysDifference'];
	workloadPeriods.forEach(period => {
		if (jsonData.allWorkloadMetrics[period]) {
			jsonData.allWorkloadMetrics[period].forEach((item: any) => {
				const athleteId = parseInt(Object.keys(item)[0]);
				result.workload_metrics.push({
					athlete_id: athleteId,
					team_id: 1, // Set default team_id to 1
					period: period,
					value: item[athleteId]
				});
			});
		}
	});

	// Parse workload metrics average
	const workloadAveragePeriods = ['today', 'todayDifference', 'last7Days', 'last7DaysDifference', 'last30Days', 'last30DaysDifference'];
	workloadAveragePeriods.forEach(period => {
		if (jsonData.allWorkloadMetricsAverage[period] !== undefined) {
			result.workload_metrics_average.push({
				period: period,
				team_id: 1, // Set default team_id to 1
				average: jsonData.allWorkloadMetricsAverage[period]
			});
		}
	});

	// Parse player line chart metrics
	const timeWindows = ['today', 'last7Days', 'last30Days'];
	timeWindows.forEach(timeWindow => {
		if (jsonData.allPlayerPageLineChartRecoveryMetrics[timeWindow]) {
			jsonData.allPlayerPageLineChartRecoveryMetrics[timeWindow].forEach((athleteData: any) => {
				const athleteId = parseInt(Object.keys(athleteData)[0]);
				athleteData[athleteId].forEach((entry: any) => {
					result.player_line_chart_metrics.push({
						athlete_id: athleteId,
						team_id: 1, // Set default team_id to 1
						time_window: timeWindow,
						label: entry.name,
						recovery: entry.recovery,
						workload: entry.workload
					});
				});
			});
		}
	});

	// Parse performance line chart metrics
	const performanceTimeWindows = ['today', 'last7Days', 'last30Days', 'last6Months'];
	performanceTimeWindows.forEach(timeWindow => {
		if (jsonData.allPerformancePageLineChartRecoveryMetrics[timeWindow]) {
			jsonData.allPerformancePageLineChartRecoveryMetrics[timeWindow].forEach((athleteData: any) => {
				const athleteId = parseInt(Object.keys(athleteData)[0]);
				athleteData[athleteId].forEach((entry: any) => {
					result.performance_line_chart_metrics.push({
						athlete_id: athleteId,
						team_id: 1, // Set default team_id to 1
						time_window: timeWindow,
						label: entry.name,
						recovery_score: entry['Recovery Score'],
						strain: entry.Strain,
						rhr: entry.RHR,
						hrv: entry.HRV,
						sleep_performance: entry['Sleep Performance %'],
						sleep_consistency: entry['Sleep Consistency %'],
						sleep_efficiency: entry['Sleep Efficiency %'],
						sleep_duration: entry['Sleep Duration (hours)'],
						restorative_sleep_duration: entry['Restorative Sleep Duration (hours)'],
						restorative_sleep: entry['Restorative Sleep %'],
						sleep_start: entry['Sleep Start'],
						sleep_end: entry['Sleep End']
					});
				});
			});
		}
	});

	// Parse homepage line chart metrics
	const homepageTimeWindows = ['today', 'last7Days', 'last30Days'];
	homepageTimeWindows.forEach(timeWindow => {
		if (jsonData.allHomepageLineChartRecoveryMetrics[timeWindow]) {
			jsonData.allHomepageLineChartRecoveryMetrics[timeWindow].forEach((entry: any) => {
				result.homepage_line_chart_metrics.push({
					time_window: timeWindow,
					label: entry.name,
					team_id: 1, // Set default team_id to 1
					recovery: entry.recovery,
					workload: entry.workload
				});
			});
		}
	});

	// Parse all-time performance line chart metrics
	if (jsonData.allTimeRecoveryMetrics && jsonData.allTimeRecoveryStats) {
		// Since these metrics are calculated per athlete from allTimeRecoveryStats
		jsonData.allTimeWorkloadStats.forEach((stat: { athlete_id: number; cycle_date: string }, index: number) => {
			const athleteId = stat.athlete_id;
			const cycleDate = stat.cycle_date;

			// Find the corresponding athlete's recovery metrics
			const athleteRecoveryData = jsonData.allTimeRecoveryMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteWorkloadData = jsonData.allTimeWorkloadMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteRHRData = jsonData.allTimeRHRMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteHRVData = jsonData.allTimeHRVMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepPerformanceData = jsonData.allTimeSleepPerformanceMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepConsistencyData = jsonData.allTimeSleepConsistencyMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepEfficiencyData = jsonData.allTimeSleepEfficiencyMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepDurationData = jsonData.allTimeSleepDurationMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteRestorativeSleepDurationData = jsonData.allTimeRestorativeSleepDurationMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteRestorativeSleepData = jsonData.allTimeRestorativeSleepMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepStartData = jsonData.allTimeSleepStartMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			const athleteSleepEndData = jsonData.allTimeSleepEndMetrics.find(
				(item: { athlete_id: number }) => item.athlete_id === athleteId
			);

			// If we have the athlete's recovery data with dates
			if (athleteRecoveryData && athleteRecoveryData.dates) {
				// Find the index of this date in the athlete's dates array
				const dateIndex = athleteRecoveryData.dates.findIndex(
					(date: string) => date === cycleDate
				);

				// Get the recovery score for this date if available
				const recoveryScore = dateIndex !== -1 &&
					athleteRecoveryData.recoveryScores &&
					dateIndex < athleteRecoveryData.recoveryScores.length ?
					athleteRecoveryData.recoveryScores[dateIndex] : null;

				const workloadScore = dateIndex !== -1 &&
					athleteWorkloadData.workloadScores &&
					dateIndex < athleteWorkloadData.workloadScores.length ?
					athleteWorkloadData.workloadScores[dateIndex] : null;

				const rhrScore = dateIndex !== -1 &&
					athleteRHRData.rhrScores &&
					dateIndex < athleteRHRData.rhrScores.length ?
					athleteRHRData.rhrScores[dateIndex] : null;

				const hrvScore = dateIndex !== -1 &&
					athleteHRVData.hrvScores &&
					dateIndex < athleteHRVData.hrvScores.length ?
					athleteHRVData.hrvScores[dateIndex] : null;

				const sleepPerformanceScore = dateIndex !== -1 &&
					athleteSleepPerformanceData.sleepPerformanceScores &&
					dateIndex < athleteSleepPerformanceData.sleepPerformanceScores.length ?
					athleteSleepPerformanceData.sleepPerformanceScores[dateIndex] : null;

				const sleepConsistencyScore = dateIndex !== -1 &&
					athleteSleepConsistencyData.sleepConsistencyScores &&
					dateIndex < athleteSleepConsistencyData.sleepConsistencyScores.length ?
					athleteSleepConsistencyData.sleepConsistencyScores[dateIndex] : null;

				const sleepEfficiencyScore = dateIndex !== -1 &&
					athleteSleepEfficiencyData.sleepEfficiencyScores &&
					dateIndex < athleteSleepEfficiencyData.sleepEfficiencyScores.length ?
					athleteSleepEfficiencyData.sleepEfficiencyScores[dateIndex] : null;

				const sleepDurationScore = dateIndex !== -1 &&
					athleteSleepDurationData.sleepDurationScores &&
					dateIndex < athleteSleepDurationData.sleepDurationScores.length ?
					athleteSleepDurationData.sleepDurationScores[dateIndex] : null;

				const restorativeSleepDurationScore = dateIndex !== -1 &&
					athleteRestorativeSleepDurationData.restorativeSleepDurationScores &&
					dateIndex < athleteRestorativeSleepDurationData.restorativeSleepDurationScores.length ?
					athleteRestorativeSleepDurationData.restorativeSleepDurationScores[dateIndex] : null;

				const restorativeSleepScore = dateIndex !== -1 &&
					athleteRestorativeSleepData.restorativeSleepScores &&
					dateIndex < athleteRestorativeSleepData.restorativeSleepScores.length ?
					athleteRestorativeSleepData.restorativeSleepScores[dateIndex] : null;

				const sleepStartScore = dateIndex !== -1 &&
					athleteSleepStartData.sleepStartScores &&
					dateIndex < athleteSleepStartData.sleepStartScores.length ?
					athleteSleepStartData.sleepStartScores[dateIndex] : null;

				const sleepEndScore = dateIndex !== -1 &&
					athleteSleepEndData.sleepEndScores &&
					dateIndex < athleteSleepEndData.sleepEndScores.length ?
					athleteSleepEndData.sleepEndScores[dateIndex] : null;

				result.all_time_metrics.push({
					athlete_id: athleteId,
					team_id: 1, // Set default team_id to 1
					label: new Date(cycleDate),
					recovery_score: recoveryScore,
					strain: workloadScore,
					rhr: rhrScore,
					hrv: hrvScore,

					sleep_performance: sleepPerformanceScore,
					sleep_consistency: sleepConsistencyScore,
					sleep_efficiency: sleepEfficiencyScore,
					sleep_duration: sleepDurationScore,
					restorative_sleep_duration: restorativeSleepDurationScore,
					restorative_sleep: restorativeSleepScore,
					sleep_start: sleepStartScore,
					sleep_end: sleepEndScore
				});
			}
		});

		// Calculate averages for all_time_metrics by athlete_id
		const athleteIds = Array.from(new Set(result.all_time_metrics.map(metric => metric.athlete_id)));

		athleteIds.forEach(athleteId => {
			const athleteMetrics = result.all_time_metrics.filter(metric => metric.athlete_id === athleteId);

			// Helper function to calculate average of a specific metric
			const calculateAverage = (metricName: keyof AllTimeMetric): number | null => {
				// Extract values and filter out null/undefined values
				const validValues = athleteMetrics
					.map(metric => metric[metricName])
					.filter((value): value is number =>
						value !== null &&
						value !== undefined &&
						!isNaN(value as number)
					);

				// If no valid values exist, return null
				if (validValues.length === 0) return null;

				// Apply scaling factor of 100/21 for strain metric
				if (metricName === 'strain') {
					const scaledValues = validValues.map(val => val * (100 / 21));
					const sum = scaledValues.reduce((acc, val) => acc + val, 0);
					return parseFloat((sum / validValues.length).toFixed(2));
				}

				// Calculate average for all other metrics
				const sum = validValues.reduce((acc, val) => acc + val, 0);
				return parseFloat((sum / validValues.length).toFixed(2));
			};

			// Calculate averages for each metric
			result.all_time_metrics_averages.push({
				athlete_id: athleteId,
				team_id: 1, // Set default team_id to 1
				recovery_score_avg: calculateAverage('recovery_score'),
				strain_avg: calculateAverage('strain'),
				rhr_avg: calculateAverage('rhr'),
				hrv_avg: calculateAverage('hrv'),
				sleep_performance_avg: calculateAverage('sleep_performance'),
				sleep_consistency_avg: calculateAverage('sleep_consistency'),
				sleep_efficiency_avg: calculateAverage('sleep_efficiency'),
				sleep_duration_avg: calculateAverage('sleep_duration'),
				restorative_sleep_duration_avg: calculateAverage('restorative_sleep_duration'),
				restorative_sleep_avg: calculateAverage('restorative_sleep')
			});
		});
	}
	const squadAvailabilityPeriods: ('today' | 'previousDay' | 'last7Days' | 'previous7Days' | 'last30Days' | 'previous30Days')[] = ['today', 'previousDay', 'last7Days', 'previous7Days', 'last30Days', 'previous30Days'];

	squadAvailabilityPeriods.forEach((period: 'today' | 'previousDay' | 'last7Days' | 'previous7Days' | 'last30Days' | 'previous30Days') => {
		if (jsonData.recoverySquadAvailability[period]) {
			jsonData.recoverySquadAvailability[period].forEach((item: any) => {
				const athleteId = parseInt(Object.keys(item)[0]);
				result.recovery_squad_availability.push({
					athlete_id: athleteId,
					team_id: 1, // Set default team_id to 1
					period: period,
					value: item[athleteId]
				});
			});
		}
	});

	// // Parse recovery squad availability
	// const recoverySquadPeriods = ['today', 'previousDay', 'last7Days', 'previous7Days', 'last30Days', 'previous30Days'];
	// recoverySquadPeriods.forEach(period => {
	// 	if (jsonData.recoverySquadAvailability && jsonData.recoverySquadAvailability[period]) {
	// 		jsonData.recoverySquadAvailability[period].forEach((item: any) => {
	// 			const athleteId = parseInt(Object.keys(item)[0]);
	// 			result.recovery_squad_availability.push({
	// 				athlete_id: athleteId,
	// 				period: period as any,
	// 				value: item[athleteId]
	// 			});
	// 		});
	// 	}
	// });

	// Create alert system metrics
	const alertSystemMetrics = [];

	// Get athletes from the context or from jsonData - convert to array to avoid Set iteration error
	const athleteIds = Array.from(new Set([
		...jsonData.RecoveryMetricsStdDev3Months.map((m: any) => m.athlete_id),
		...jsonData.WorkloadMetricsStdDev3Months.map((m: any) => m.athlete_id),
		...jsonData.RHRMetrics3Months.map((m: any) => m.athlete_id)
	]));

	// Convert array types to match DB schema
	for (const athleteId of athleteIds) {
		const recoveryMetrics = jsonData.RecoveryMetricsStdDev3Months.find((m: any) => m.athlete_id === athleteId);
		const workloadMetrics = jsonData.WorkloadMetricsStdDev3Months.find((m: any) => m.athlete_id === athleteId);
		const rhrMetrics = jsonData.RHRMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const hrvMetrics = jsonData.HRVMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const sleepPerformanceMetrics = jsonData.SleepPerformanceMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const sleepConsistencyMetrics = jsonData.SleepConsistencyMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const sleepEfficiencyMetrics = jsonData.SleepEfficiencyMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const sleepDurationMetrics = jsonData.SleepDurationMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const restorativeSleepDurationMetrics = jsonData.RestorativeSleepDurationMetrics3Months.find((m: any) => m.athlete_id === athleteId);
		const restorativeSleepMetrics = jsonData.RestorativeSleepMetrics3Months.find((m: any) => m.athlete_id === athleteId);

		if (recoveryMetrics && workloadMetrics && rhrMetrics && hrvMetrics
			&& sleepPerformanceMetrics && sleepConsistencyMetrics && sleepEfficiencyMetrics
			&& sleepDurationMetrics && restorativeSleepDurationMetrics && restorativeSleepMetrics) {

			alertSystemMetrics.push({
				athlete_id: athleteId,
				recovery_score_three_month_avg: recoveryMetrics.three_month_average,
				recovery_score_three_month_std_dev: recoveryMetrics.three_month_standard_deviation,
				recovery_score_all_time_avg: recoveryMetrics.all_time_average,
				recovery_score_all_time_std_dev: recoveryMetrics.all_time_standard_deviation,
				strain_three_month_avg: workloadMetrics.three_month_average,
				strain_three_month_std_dev: workloadMetrics.three_month_standard_deviation,
				strain_all_time_avg: workloadMetrics.all_time_average,
				strain_all_time_std_dev: workloadMetrics.all_time_standard_deviation,
				rhr_three_month_avg: rhrMetrics.three_month_average,
				rhr_three_month_std_dev: rhrMetrics.three_month_standard_deviation,
				rhr_all_time_avg: rhrMetrics.all_time_average,
				rhr_all_time_std_dev: rhrMetrics.all_time_standard_deviation,
				hrv_three_month_avg: hrvMetrics.three_month_average,
				hrv_three_month_std_dev: hrvMetrics.three_month_standard_deviation,
				hrv_all_time_avg: hrvMetrics.all_time_average,
				hrv_all_time_std_dev: hrvMetrics.all_time_standard_deviation,
				sleep_performance_three_month_avg: sleepPerformanceMetrics.three_month_average,
				sleep_performance_three_month_std_dev: sleepPerformanceMetrics.three_month_standard_deviation,
				sleep_performance_all_time_avg: sleepPerformanceMetrics.all_time_average,
				sleep_performance_all_time_std_dev: sleepPerformanceMetrics.all_time_standard_deviation,
				sleep_consistency_three_month_avg: sleepConsistencyMetrics.three_month_average,
				sleep_consistency_three_month_std_dev: sleepConsistencyMetrics.three_month_standard_deviation,
				sleep_consistency_all_time_avg: sleepConsistencyMetrics.all_time_average,
				sleep_consistency_all_time_std_dev: sleepConsistencyMetrics.all_time_standard_deviation,
				sleep_efficiency_three_month_avg: sleepEfficiencyMetrics.three_month_average,
				sleep_efficiency_three_month_std_dev: sleepEfficiencyMetrics.three_month_standard_deviation,
				sleep_efficiency_all_time_avg: sleepEfficiencyMetrics.all_time_average,
				sleep_efficiency_all_time_std_dev: sleepEfficiencyMetrics.all_time_standard_deviation,
				sleep_duration_three_month_avg: Math.round(sleepDurationMetrics.three_month_average),
				sleep_duration_three_month_std_dev: sleepDurationMetrics.three_month_standard_deviation,
				sleep_duration_all_time_avg: Math.round(sleepDurationMetrics.all_time_average),
				sleep_duration_all_time_std_dev: sleepDurationMetrics.all_time_standard_deviation,
				restorative_sleep_duration_three_month_avg: Math.round(restorativeSleepDurationMetrics.three_month_average),
				restorative_sleep_duration_three_month_std_dev: restorativeSleepDurationMetrics.three_month_standard_deviation,
				restorative_sleep_duration_all_time_avg: Math.round(restorativeSleepDurationMetrics.all_time_average),
				restorative_sleep_duration_all_time_std_dev: restorativeSleepDurationMetrics.all_time_standard_deviation,
				restorative_sleep_three_month_avg: restorativeSleepMetrics.three_month_average,
				restorative_sleep_three_month_std_dev: restorativeSleepMetrics.three_month_standard_deviation,
				restorative_sleep_all_time_avg: restorativeSleepMetrics.all_time_average,
				restorative_sleep_all_time_std_dev: restorativeSleepMetrics.all_time_standard_deviation
			});
		}
	}

	// Insert DBRT data
	if (jsonData.dbrt) {
		result.dbrt = jsonData.dbrt;
	}

	return {
		recovery_metrics: result.recovery_metrics,
		recovery_metrics_average: result.recovery_metrics_average,
		workload_metrics: result.workload_metrics,
		workload_metrics_average: result.workload_metrics_average,
		player_line_chart_metrics: result.player_line_chart_metrics,
		performance_line_chart_metrics: result.performance_line_chart_metrics,
		all_time_metrics: result.all_time_metrics,
		all_time_metrics_averages: result.all_time_metrics_averages,
		homepage_line_chart_metrics: result.homepage_line_chart_metrics,
		recovery_squad_availability: result.recovery_squad_availability,
		dbrt: result.dbrt,
		alert_system_metrics: alertSystemMetrics
	};
}

async function insertDataIntoSupabase(supabase: SupabaseClient, data: DatabaseTables) {
	const team_id = 1; // Set default team_id to 1
	try {
		// Verify database connection
		const { data: connectionTest, error: connectionError } = await supabase
			.schema('calculations_schema')
			.from('recovery_metrics')
			.select('count')
			.limit(1);

		if (connectionError) {
			throw new Error(`Database connection error: ${connectionError.message}`);
		}

		// Format timestamps for all_time_metrics
		const formattedAllTimeMetrics = data.all_time_metrics.map(metric => ({
			...metric,
			team_id,
			label: new Date(metric.label).toISOString(),
			sleep_start: metric.sleep_start ? new Date(metric.sleep_start).toISOString() : null,
			sleep_end: metric.sleep_end ? new Date(metric.sleep_end).toISOString() : null
		}));

		// Format timestamps for performance_line_chart_metrics
		const formattedPerformanceLineChartMetrics = data.performance_line_chart_metrics.map(metric => ({
			...metric,
			team_id,
			sleep_start: metric.sleep_start ? new Date(metric.sleep_start).toISOString() : null,
			sleep_end: metric.sleep_end ? new Date(metric.sleep_end).toISOString() : null
		}));

		// Prepare all insert operations
		const insertOperations = [];

		// DBRT data
		if (data.dbrt) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('dbrt').insert([data.dbrt]).select()
			);
		}

		// All time metrics
		if (formattedAllTimeMetrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('all_time_metrics').insert(formattedAllTimeMetrics).select()
			);
		}

		// Recovery metrics
		if (data.recovery_metrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('recovery_metrics')
					.insert(data.recovery_metrics.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Recovery metrics average
		if (data.recovery_metrics_average.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('recovery_metrics_average')
					.insert(data.recovery_metrics_average.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Workload metrics
		if (data.workload_metrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('workload_metrics')
					.insert(data.workload_metrics.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Workload metrics average
		if (data.workload_metrics_average.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('workload_metrics_average')
					.insert(data.workload_metrics_average.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Player line chart metrics
		if (data.player_line_chart_metrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('player_line_chart_metrics')
					.insert(data.player_line_chart_metrics.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Performance line chart metrics
		if (formattedPerformanceLineChartMetrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('performance_line_chart_metrics')
					.insert(formattedPerformanceLineChartMetrics).select()
			);
		}

		// All time metrics averages
		if (data.all_time_metrics_averages.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('all_time_metrics_averages')
					.insert(data.all_time_metrics_averages.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Homepage line chart metrics
		if (data.homepage_line_chart_metrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('homepage_line_chart_metrics')
					.insert(data.homepage_line_chart_metrics.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Recovery squad availability
		if (data.recovery_squad_availability.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('recovery_squad_availability')
					.insert(data.recovery_squad_availability.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Alert system metrics
		if (data.alert_system_metrics.length > 0) {
			insertOperations.push(
				supabase.schema('calculations_schema').from('alert_system')
					.insert(data.alert_system_metrics.map(metric => ({ ...metric, team_id }))).select()
			);
		}

		// Execute all insert operations in parallel
		const results = await Promise.all(insertOperations);

		// Check for errors in results
		const errors = results.filter(result => result.error);
		if (errors.length > 0) {
			throw new Error(`Some insert operations failed: ${JSON.stringify(errors)}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Error inserting data into Supabase:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unknown error occurred while inserting data',
			timestamp: new Date().toISOString()
		};
	}
}