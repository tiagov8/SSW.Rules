import React, { useState, useRef, useEffect } from 'react';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useSortItems from '../../hooks/useSortItems';
import useFilterSort from '../../hooks/useFilterSort';
import useOutsideClick from '../../hooks/useOutsideClick';

export const FilterOptions = {
  Nr: 'Newest Rules',
  Or: 'Oldest Rules',
  Re: 'Recent Edits',
  Le: 'Stale Edits',
};

export const SelectOptions = {
  Today: 'Today',
  Lw: 'Last Week',
  Lm: 'Last Month',
  L3m: 'Last 3 Months',
  L6m: 'Last 6 Months',
  Ly: 'Last Year',
  All: 'All Time',
  Custom: 'Custom',
};

const Filter = ({ selected, close }) => {
  const [background, setBackground] = useState(false);
  const [custom, setCustom] = useState(false);

  const filterRef = useSortItems(useRef(), useRef(), useRef());

  const dropDownRef = useRef();
  useOutsideClick(dropDownRef, () => {
    setOpen(false);
    setCustom(false);
  });

  const { filters, set, clear } = useFilterSort([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    selected(filters);
  }, [filters]);

  const validateInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  const clearValues = () => {
    clear();
    setBackground(false);
  };

  const handleChange = (e) => {
    e.target.value === SelectOptions.Custom
      ? setCustom(true)
      : setCustom(false);
  };

  //Todo(Jack): Fix clicking on the icon to close
  //!Bug - Currently reopens after a slight delay...
  return (
    <div className="relative inline-block text-left">
      <button
        className={'border w-10 h-10 bg-red-500'}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <FontAwesomeIcon className="text-lg" color="white" icon={faSlidersH} />
      </button>

      {open && (
        <>
          <div className="dropdown-list w-72 z-50	" ref={dropDownRef}>
            <div className="dropdown-container">
              <div className="py-1 " role="none">
                <div
                  className="grid grid-cols-3 justify-items-center mt-3"
                  role="menuitem"
                  id="menu-item-0"
                >
                  <label
                    htmlFor="created"
                    className="justify-self-start text-base"
                  >
                    Filter By
                  </label>
                  <select
                    ref={filterRef.filter}
                    id="created"
                    name="created"
                    className="text-start border rounded-md col-start-2 col-span-2 w-full text-base focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  >
                    <option id="1">{FilterOptions.Nr}</option>
                    <option id="2">{FilterOptions.Or}</option>
                    <option id="3">{FilterOptions.Re}</option>
                    <option id="3">{FilterOptions.Le}</option>
                  </select>
                </div>
                <div
                  className="grid grid-cols-3 justify-items-center mt-3"
                  role="menuitem"
                  id="menu-item-1"
                >
                  <label
                    htmlFor="created"
                    className="justify-self-start text-base"
                  >
                    Within
                  </label>
                  <select
                    ref={filterRef.select}
                    id="created"
                    name="created"
                    className="text-start border rounded-md col-start-2 col-span-2 w-full text-base focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    onChange={handleChange}
                    onBlur={handleChange}
                  >
                    <option id="0">{SelectOptions.All}</option>
                    <option id="1">{SelectOptions.Today}</option>
                    <option id="2">{SelectOptions.Lw}</option>
                    <option id="3">{SelectOptions.Lm}</option>
                    <option id="4">{SelectOptions.L3m}</option>
                    <option id="5">{SelectOptions.L6m}</option>
                    <option id="6">{SelectOptions.Ly}</option>
                    <option id="8">{SelectOptions.Custom}</option>
                  </select>
                </div>
                {custom && (
                  <div
                    className="grid grid-cols-3 justify-items-center mt-3"
                    role="menuitem"
                    id="menu-item-2"
                  >
                    <input
                      ref={filterRef.input}
                      className="border rounded-md col-start-2 col-span-1 w-full text-base focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                      onInput={validateInput}
                    />
                    <span className="inline-block text-base align-baseline justify-self-start ml-1">
                      Days
                    </span>
                  </div>
                )}
                <div
                  className="grid grid-cols-3 justify-items-center mt-3"
                  role="menuitem"
                  id="menu-item-3"
                >
                  <button
                    className="col-start-3 btn btn-red rounded"
                    onClick={() => {
                      set({
                        filter: filterRef.filter.current.value,
                        select: filterRef.select.current.value,
                        input: filterRef.input.current?.value || null,
                      });
                      setOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bubble-arrow" style={{ left: '7px' }}>
            ▲
          </div>
        </>
      )}
    </div>
  );
};

export default Filter;
