'use client'

import Switch from '@mui/material/Switch';
import './switchToggle.css';
import { useState, useEffect } from 'react';

interface SwitchToggleProps {
  name: string;
  name2?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export default function SwitchToggle({ name, checked, onChange, name2 }: SwitchToggleProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="switch-toggle d-flex flex-row align-items-center gap-1">
      <p className="name">{name}</p>
      {isMounted ? (
        <Switch
          checked={checked}
          onChange={(event, value) => onChange(value)}
          sx={{
            '& .MuiSwitch-switchBase': {
              '&.Mui-checked': {
                // Selected state
                color: 'var(--white)',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'var(--white)',
                  opacity: 0.7,
                },
              },
            },
            '& .MuiSwitch-track': {
              // Unselected state
              backgroundColor: 'var(--gray)',
            },
          }}
        />
      ) : (
        <div className="switch-placeholder" style={{ width: 58, height: 38 }} />
      )}
      <p className="name2 d-flex justify-content-end align-items-center">{name2}</p>
    </div>
  );
} 