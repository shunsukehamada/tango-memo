import React, { useContext } from 'react';
import { PoSs } from '../../pages/register';
import { filterContext, setFilterContext } from './FilterProvider';

type Props = {};

const PosFilter: React.FC<Props> = ({}) => {
    const filterStates = useContext(filterContext);
    const setFilterStates = useContext(setFilterContext);
    return (
        <div className="mr-5">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                <ul className="flex items-center">
                    {Object.keys(PoSs).map((pos) => {
                        return (
                            <li className="mx-2" key={pos}>
                                <label>
                                    <span
                                        className="font-bold text-lg text-gray-400 select-none shadow-gray-500 p-1 rounded-sm whitespace-nowrap"
                                        style={
                                            filterStates[pos]
                                                ? {
                                                      color: 'black',
                                                      boxShadow: '0px 1px 2px 1px rgb(0 0 0 / 0.5)',
                                                  }
                                                : { boxShadow: '1px 2px 3px 1px rgb(0 0 0 / 0.5)' }
                                        }
                                        onClick={() => {
                                            const newStates = { ...filterStates, [pos]: !filterStates[pos] };
                                            setFilterStates(newStates);
                                        }}
                                    >
                                        {PoSs[pos]}
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </form>
        </div>
    );
};

export default PosFilter;
