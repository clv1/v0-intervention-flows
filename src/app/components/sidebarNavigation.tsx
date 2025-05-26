'use client'

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import StackedLineChartOutlinedIcon from '@mui/icons-material/StackedLineChartOutlined';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sidebarData } from '../data/data';

export function SidebarNavigation() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/home') {
      setActiveId(1);
    } else if (pathname.startsWith('/player/')) {
      setActiveId(3);
    }
    else if (pathname.startsWith('/player-performance/')) {
      setActiveId(5);
    } else if (pathname.startsWith('/schedule-page')) {
      setActiveId(6);
    }
  }, [pathname]);

  const handleNavClick = (id: number) => {
    if (id == 1 || id == 3 || id == 5 || id == 6) {
      setActiveId(id);
      if (id === 1) {
        router.push('/home');
      } else if (id === 3) {
        router.push('/player/1');
      } else if (id === 5) {
        router.push('/player-performance/1');
      } else if (id === 6) {
        router.push('/schedule-page');
      }
    }
  };

  return (
    <div className='d-flex flex-column gap-5'>
      <div className='d-flex flex-column gap-4'>
        <img src='/assets/images/logo.png' />
        <div className='d-flex flex-column gap-2'>
          {sidebarData[1].map(item => (
            <li key={uuidv4()} className={`d-flex flex-column gap-2 ${activeId === item.id ? 'active' : undefined}`}>
              <a className='d-flex gap-2' onClick={() => handleNavClick(item.id)}>
                {item.id === 1 ? <SpaceDashboardOutlinedIcon /> :
                  item.id === 2 ? <AddCircleOutlineOutlinedIcon /> :
                    item.id === 3 ? <GroupOutlinedIcon /> :
                      item.id === 4 ? <BoltOutlinedIcon /> :
                        item.id === 6 ? <CalendarMonthOutlinedIcon /> :
                          <StackedLineChartOutlinedIcon />}
                <p className='d-flex justify-content-center align-items-center'>{item.name}</p>
              </a>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
} 