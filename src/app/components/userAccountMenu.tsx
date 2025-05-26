import React, { forwardRef } from 'react';
import './userAccountMenu.css';
import { logout } from '@/logout/actions';
import LogoutIcon from '@mui/icons-material/Logout';
interface UserAccountMenuProps {
    classNameMenu?: string;
}
const handleLogout = () => {
    logout();
}
const UserAccountMenu = forwardRef<HTMLDivElement, UserAccountMenuProps>(({ classNameMenu }, ref) => {
    return (
        <div id='user-account-menu'>
            <div ref={ref} className={"settings-menu " + classNameMenu}>
                <div className="menu-item header-item">
                    <span><b>Account Menu</b></span>
                    <br />
                </div>
                <hr />
                {/* <a>
                    <div className="menu-item">
                        <span className="settings-menu-text">Account Settings</span>
                    </div>
                </a>
                <a>
                    <div className="menu-item">
                        <span className="settings-menu-text">Account Plan</span>
                    </div>
                </a>
                <a>
                    <div className="menu-item">
                        <span className="settings-menu-text">Preferences</span>
                    </div>
                </a> */}
                <a>
                    <div className="menu-item" onClick={handleLogout}>
                        <LogoutIcon />
                        <span className="settings-menu-text">Log out</span>
                    </div>
                </a>
            </div>
        </div>
    );
});

export default UserAccountMenu;