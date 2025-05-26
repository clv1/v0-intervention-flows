import { userTeamLink } from "@/data/data";
import { createClient } from "@/lib/client";
import { redirect } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { UserTeam, UserInfo, User } from '@/lib/types';
import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import UserAccountMenu from "./userAccountMenu";
import useOutsideClick from "@/hooks/useOutsideClick";
import './userAccount.css';
export function UserAccount() {
  const [user, setUser] = useState<{
    firstName: string | undefined;
    lastName: string | undefined;
    position: string | undefined;
    teamID: number | undefined;
  } | null>(null)

  const [accountMenuOpened, setAccountMenuOpened] = useState(false);

  const userAccountMenu = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        redirect('/login')
      }
      const userID = data.user.id
      // Query the user table to get the user_info_id and role for the authenticated user
      const userTable: PostgrestSingleResponse<User[]> = await supabase
        .from("user")
        .select("user_info_id, role")
        .eq('supabase_auth_uid', userID);

      // Extract user info ID and position from the response
      const userInfoID = JSON.parse(JSON.stringify(userTable, null, 2)).data[0].user_info_id, userInfoPositon = JSON.parse(JSON.stringify(userTable, null, 2)).data[0].role;

      // Get the user's first and last name from the user_info table
      const userInfoTable: PostgrestSingleResponse<UserInfo[]> = await supabase
        .from("user_info")
        .select("first_name, last_name")
        .eq('user_info_id', userInfoID);

      // Get the user's team ID from the user_team table
      const userTeamTable: PostgrestSingleResponse<UserTeam[]> = await supabase
        .from("user_team")
        .select("team_id")
        .eq('supabase_auth_uid', userID);
      const userInfo = {
        firstName: userInfoTable.data ? userInfoTable.data[0].first_name : '',
        lastName: userInfoTable.data ? userInfoTable.data[0].last_name : '',
        position: userInfoPositon,
        teamID: userTeamTable.data ? Number(userTeamTable.data[0].team_id) : undefined,
      };
      setUser(userInfo)
    }
    fetchUser()
  }, []);
  const handleMenuToggle = () => {
    setAccountMenuOpened((prev) => !prev);
  }
  useOutsideClick(userAccountMenu, () => {
    if (accountMenuOpened) setAccountMenuOpened(false);
  });
  return (
    <>
      <div id='user-account' onMouseDown={handleMenuToggle}>
        {/* <img src="https://wallpapers-clan.com/wp-content/uploads/2023/05/cool-pfp-02.jpg" alt="user" className="account-img" /> */}
        <i className="bi bi-person-circle" ></i>
        <div className='account-info'>
          <div className='account-name'>{user?.firstName} {user?.lastName}</div>
          <div className='account-username'>{user?.position}</div>
        </div>
        {accountMenuOpened ? <i className="arrow-icon bi bi-caret-down-fill"></i> : <i className="arrow-icon bi bi-caret-up-fill"></i>}
        {accountMenuOpened ? (
          <UserAccountMenu ref={userAccountMenu} classNameMenu="openedMenu" />
        ) : (
          <UserAccountMenu ref={userAccountMenu} classNameMenu="closedMenu" />
        )}
      </div>


    </>
  );
} 