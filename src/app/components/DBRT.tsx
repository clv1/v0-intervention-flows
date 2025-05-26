'use client';

import './DBRT.css';

export default function DBRT({ downtime_days, total_days }: { downtime_days: number, total_days: number }) {
    return (
        <div id='dbrt-container' className='d-flex flex-column'>
            <div className='dbrt-header'>
                <span className='title'>DBRT</span>
                <span className='info-icon' data-tooltip="DBRT stands for Days Below Recovery Threshold. This metric tracks the number of days where players were unable to meet their recovery targets, indicating potential overtraining or insufficient recovery periods. A lower DBRT percentage indicates better overall recovery management.">ⓘ</span>
            </div>

            <div className='dbrt-content'>
                <div className='metrics'>
                    <div className='metric'>
                        <span className='number'>{downtime_days}</span>
                        <span className='label'>downtime days</span>
                    </div>
                    <span className='separator'>/</span>
                    <div className='metric'>
                        <span className='number'>{total_days}</span>
                        <span className='label'>total player days</span>
                    </div>
                </div>

                <div className='recovery-bar-container'>
                    <div className='recovery-labels'>
                        <span className='below'>Below Recovery: {Math.round(downtime_days / total_days * 100)}%</span>
                        <span className='good'>Good Recovery: {Math.round(100 - (downtime_days / total_days * 100))}%</span>
                    </div>
                    <div className='recovery-bar'>
                        <div className='below-recovery' style={{ width: `${downtime_days / total_days * 100}%` }}>
                            <span className='days'>{downtime_days} days</span>
                        </div>
                        <div className='good-recovery' style={{ width: `${100 - (downtime_days / total_days * 100)}%` }}>
                            <span className='days'>{total_days - downtime_days} days</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 