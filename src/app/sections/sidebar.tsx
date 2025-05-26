'use client'

import { SidebarNavigation } from '@/components/sidebarNavigation';
import { UserAccount } from '@/components/userAccount';
import './sidebar.css';

export default function Sidebar() {

  return (
    <div id="sidebar" className='d-flex flex-column justify-content-between'>
      <SidebarNavigation />
      <UserAccount />
    </div>
  );
}