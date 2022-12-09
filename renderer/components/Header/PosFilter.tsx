import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { PoSs } from '../../pages/register';
import { filterContext, setFilterContext } from './FilterProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { VscListFilter } from 'react-icons/vsc';

type Props = {};

const PosFilter: React.FC<Props> = ({}) => {
    const filterStates = useContext(filterContext);
    const setFilterStates = useContext(setFilterContext);
    const [isShow, setIsShow] = useState<boolean>(false);
    useEffect(() => {
        const newStates = { ...filterStates };
        Object.keys(newStates).forEach((pos) => {
            newStates[pos] = false;
        });
        setFilterStates(newStates);
    }, [isShow]);
    return (
        <div className="flex items-center">
            <AnimatePresence>
                {isShow && (
                    <motion.div
                        key="PoSFilter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: ['20px', '0px'] }}
                        exit={{ opacity: 0, x: ['0px', '20px'] }}
                        transition={{ duration: 0.3 }}
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
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                className="cursor-pointer select-none flex justify-center items-center mx-3"
                onClick={() => {
                    setIsShow((isShow) => !isShow);
                }}
            >
                {isShow ? (
                    <div>
                        <VscListFilter size={'2em'} strokeWidth="0.3px" />
                    </div>
                ) : (
                    <div>
                        <VscListFilter size={'2em'} strokeWidth="0.3px" opacity={0.6} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PosFilter;
