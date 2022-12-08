import { useRouter } from 'next/router';
import { useEffect, useRef, useState, useCallback, Ref, useContext } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Select from 'react-select';
import { RiPencilFill } from 'react-icons/ri';
import { ChildDirectory, DirectoryStructure } from '../components/SideBar/SideBar';
import Suggestion from '../components/Suggestion';
import { useTheme } from 'next-themes';

export type PoSsType =
    | 'Noun'
    | 'Verb'
    | 'Adjective'
    | 'Adverb'
    | 'Conjunction'
    | 'Pronoun'
    | 'Preposition'
    | 'Interjection';

export const PoSs: Readonly<{ [pos in PoSsType]: string }> = {
    Noun: '名詞',
    Verb: '動詞',
    Adjective: '形容詞',
    Adverb: '副詞',
    Conjunction: '接続詞',
    Pronoun: '代名詞',
    Preposition: '前置詞',
    Interjection: '感動詞',
};

type Inputs = {
    english: string;
    japanese: string;
    annotation: string;
    folder: {
        label: string;
        value: ChildDirectory;
    };
    pos: PoSsType[];
};

const Register: React.FC = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);
    const [directoryStructureState, setDirectoryStructureState] = useState<DirectoryStructure[]>([]);
    const [info, setInfo] = useState<{ japanese: string; poss: PoSsType[] }>({ japanese: '', poss: [] });
    const [rows, setRows] = useState<number>(1);
    const animationControl = useAnimationControls();
    const formRef = useRef();
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const { theme } = useTheme();

    if (typeof document !== 'undefined') {
        document.addEventListener('wheel', (e) => {
            if (e.deltaX <= -40) {
                setIsTransitioned(true);
            }
        });
    }
    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        reset,
        setValue,
    } = useForm<Inputs>({ mode: 'all', defaultValues: { japanese: '', pos: [] } });
    const reactHookFormJapaneseRef = register('japanese').ref;

    useEffect(() => {
        const getAllFolders = async () => {
            const allFolders = (await global.ipcRenderer.invoke('get-all-folders')) as DirectoryStructure[];
            setDirectoryStructureState(allFolders);
        };
        animationControl.start({ x: ['10%', '0%'], opacity: [0, 1], transition: { duration: 0.25 } });
        getAllFolders();
    }, []);

    useEffect(() => {
        const transition = async () => {
            if (isTransitioned) {
                await animationControl.start({
                    x: '50%',
                    opacity: [1, 1, 0.25, 0],
                    transition: { duration: 0.25 },
                });
                router.push('/');
            }
        };
        transition();
    }, [isTransitioned]);

    useEffect(() => {
        setRows(1);
        setValue('japanese', info.japanese);
        setValue('pos', info.poss);
    }, [info]);

    useEffect(() => {
        if (textAreaRef.current?.value === '') {
            setRows(1);
            return;
        }
        setRows(
            Math.max(
                Math.floor(textAreaRef.current?.scrollHeight / 28),
                textAreaRef.current?.value.split(/\r*\n/).length
            )
        );
    }, [watch('japanese')]);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        global.ipcRenderer.send('register-new-word', data);
        const folder = data.folder;
        reset();
        setValue('folder', folder);
    };

    const options = [
        ...directoryStructureState.map((directory) => {
            return {
                label: directory.parent.name,
                options: [...directory.children].map((folder) => {
                    return {
                        label: folder.name,
                        value: folder,
                    };
                }),
            };
        }),
    ];

    const useCombinedRefs = <T extends any>(...refs: Array<Ref<T>>): Ref<T> =>
        useCallback(
            (element: T) =>
                refs.forEach((ref) => {
                    if (!ref) {
                        return;
                    }

                    // Ref can have two types - a function or an object. We treat each case.
                    if (typeof ref === 'function') {
                        return ref(element);
                    }

                    // As per https://github.com/facebook/react/issues/13029
                    // it should be fine to set current this way.
                    (ref as any).current = element;
                }),
            refs
        );
    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div animate={animationControl}>
                    <div className="h-screen w-screen overflow-hidden flex justify-center items-center">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="h-3/4 w-3/4 flex items-center flex-col justify-around"
                            ref={formRef}
                        >
                            <div className="m-1 w-5/6 flex justify-between">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">英単語:</span>
                                </label>
                                <Suggestion
                                    value={watch('english')}
                                    setValue={(value: string) => {
                                        setValue('english', value);
                                    }}
                                    setInfo={setInfo}
                                >
                                    <input
                                        {...register('english', { required: true })}
                                        className="w-full flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold placeholder:select-none"
                                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                        placeholder={errors.english?.type === 'required' ? '英単語は必須です' : ''}
                                        list="suggest"
                                    />
                                </Suggestion>
                            </div>
                            <div className="m-1 w-5/6 flex justify-between">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">訳:</span>
                                </label>
                                <textarea
                                    {...register('japanese', { required: true })}
                                    className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 resize-none text-center text-xl font-bold placeholder:select-none"
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                    rows={rows <= 10 ? rows : 10}
                                    placeholder={errors.japanese?.type === 'required' ? '訳は必須です' : ''}
                                    ref={useCombinedRefs(textAreaRef, reactHookFormJapaneseRef)}
                                ></textarea>
                            </div>
                            <div className="m-1 w-5/6 flex justify-between">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">注釈:</span>
                                </label>
                                <input
                                    {...register('annotation')}
                                    className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold"
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                />
                            </div>
                            <div className="m-1 w-5/6 flex justify-between items-center">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">フォルダ:</span>
                                </label>
                                <Controller
                                    control={control}
                                    name="folder"
                                    rules={{ required: true }}
                                    render={({ field }) => {
                                        return (
                                            <>
                                                <Select
                                                    options={options}
                                                    instanceId="folder-select"
                                                    className="flex-1"
                                                    styles={{
                                                        control: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                borderWidth: 0,
                                                                borderBottomWidth: '2px',
                                                                borderStyle: 'solid',
                                                                borderColor: 'rgb(209 213 219)',
                                                                borderRadius: 0,
                                                                boxShadow: 'none',
                                                                ':focus': { outlineColor: 'red' },
                                                                backgroundColor: 'rgba(0,0,0,0)',
                                                            };
                                                        },
                                                        group: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                fontSize: '1.1rem',
                                                                color: 'black',
                                                            };
                                                        },
                                                        groupHeading: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                fontWeight: 700,
                                                            };
                                                        },
                                                        valueContainer: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                textAlign: 'center',
                                                                fontSize: '1.2rem',
                                                                fontWeight: 700,
                                                                userSelect: 'none',
                                                                color: 'black',
                                                            };
                                                        },
                                                        singleValue: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                color: theme === 'dark' ? 'white' : 'dark',
                                                            };
                                                        },
                                                    }}
                                                    value={watch('folder')}
                                                    onChange={field.onChange}
                                                />
                                            </>
                                        );
                                    }}
                                />
                            </div>
                            <div>
                                {Object.keys(PoSs).map((key) => {
                                    return (
                                        <label className="m-2" key={key}>
                                            <input
                                                type="checkbox"
                                                className="scale-125"
                                                name="PoS"
                                                value={key}
                                                {...register('pos')}
                                            />
                                            <span className="m-1 text-2xl select-none">{PoSs[key]}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div
                                onClick={handleSubmit(onSubmit)}
                                className="flex items-center cursor-pointer border-b-2 border-solid border-gray-500"
                            >
                                <RiPencilFill size={'2em'} />
                                <span className="text-2xl select-none">登録</span>
                            </div>
                            {/* <input type="submit" value="登録" /> */}
                        </form>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};
export default Register;
