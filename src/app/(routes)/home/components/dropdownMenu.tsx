'use client'

import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './dropdownMenu.css';
import { useOnClickOutside } from 'usehooks-ts';

/**
 * DropdownMenu component renders a dropdown menu with customizable items.
 * 
 * This component uses the `useState` and `useEffect` hooks to manage the state and lifecycle of the dropdown menu.
 * It also uses the `useRef` hook to handle clicks outside the dropdown menu to close it.
 * 
 * The `handleDropdown` function toggles the visibility and rotation of the dropdown arrow and list.
 * The `handleDropdownSelection` function updates the dropdown button's text with the selected item's text.
 * 
 * The `useOnClickOutside` custom hook is used to close the dropdown menu when a click is detected outside of it.
 */
export default function DropdownMenu({dropdownComponent, dropdownName, menuItems}: {dropdownComponent: string, dropdownName: string, menuItems: string[]}) {
  const [dropdownList, setDropdownList] = useState<Element | null>(null);
  const [dropdownButtonSpan, setDropdownButtonSpan] = useState<Element>();
  const [dropdownArrow, setDropdownArrow] = useState<Element | null>(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const ref = useRef(null); // Ref to handle clicks outside the dropdown menu

  useEffect(() => {
    setDropdownList(document.querySelector(`${dropdownComponent} #list`)!);
    setDropdownButtonSpan(document.querySelector(`${dropdownComponent} #dropdown-name`)!);
    setDropdownArrow(document.querySelector(`${dropdownComponent} #arrow`)!);
  }, [dropdownComponent]);

  // Function to handle the dropdown toggle
  const handleDropdown = () => {
    setMenuOpened(!menuOpened);
    if (dropdownArrow) dropdownArrow.classList.toggle('rotate-180'); // Toggle arrow rotation
    if (dropdownList) dropdownList.classList.toggle('opacity-1'); // Toggle list opacity
    if (dropdownList) dropdownList.classList.toggle('visibility-visible'); // Toggle list visibility
  }
  
  // Custom hook to handle clicks outside the dropdown menu
  useOnClickOutside(ref, handleDropdown);

  // Function to handle dropdown item selection
  const handleDropdownSelection = (e: React.MouseEvent<HTMLLabelElement>) => {
    handleDropdown();
    if (dropdownButtonSpan) dropdownButtonSpan.textContent = (e.target as HTMLElement).innerText; // Set the selected item text to the button span
  }

  return (
    <div
      id="dropdown-menu"
      ref={menuOpened ? ref : undefined} // Set ref only when menu is opened
    >
      <button
          className="form-control d-flex justify-content-between align-items-center gap-3"
          type='button'
          id='dropdown-button'
          onClick={handleDropdown} // Toggle dropdown on button click
      >
          <span id='dropdown-name'>{dropdownName}</span>
          <span id="arrow"></span> {/* Arrow element */}
      </button>
      <ul id="list">
        {menuItems.map(item => (
          <li key={uuidv4()}>
            <label onClick={handleDropdownSelection}>{item}</label>
          </li>
        ))}
      </ul>
    </div>
  );
}