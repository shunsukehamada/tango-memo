import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Select from 'react-select';
import { RiPencilFill } from 'react-icons/ri';
import { DirectoryStructure } from '../components/SideBar/SideBar';
import DataList from '../components/DataList';
type Inputs = {
    english: string;
    japanese: string;
    annotation: string;
    folder: {
        label: string;
        value: { parent: string; child: string };
    };
    pos: (keyof PoSs)[];
};

export type PoSs = {
    Noun: '名詞';
    Verb: '動詞';
    Adjective: '形容詞';
    Adverb: '副詞';
    Conjunction: '接続詞';
    Pronoun: '代名詞';
    Preposition: '前置詞';
    Interjection: '感動詞';
};

// FIXME: 訳の自動改行
const Register: React.FC = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);
    const [directoryStructureState, setDirectoryStructureState] = useState<DirectoryStructure[]>([]);
    const [info, setInfo] = useState<{ japanese: string; poss: (keyof PoSs)[] }>({ japanese: '', poss: [] });
    const animationControl = useAnimationControls();

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
        setValue('japanese', info.japanese);
        setValue('pos', info.poss);
    }, [info]);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        global.ipcRenderer.send('register-new-word', data);
        const folder = data.folder;
        reset();
        setValue('folder', folder);
    };

    const PoSs: PoSs = {
        Noun: '名詞',
        Verb: '動詞',
        Adjective: '形容詞',
        Adverb: '副詞',
        Conjunction: '接続詞',
        Pronoun: '代名詞',
        Preposition: '前置詞',
        Interjection: '感動詞',
    };

    const textareaValue = watch('japanese');
    const rows = textareaValue?.split(/\r*\n/).length;

    const options = [
        ...directoryStructureState.map((directory) => {
            return {
                label: directory.parent,
                options: [
                    ...directory.children.map((folder) => {
                        return { label: folder, value: { parent: directory.parent, child: folder } };
                    }),
                ],
            };
        }),
    ];
    const formRef = useRef();
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
                                <DataList
                                    value={watch('english')}
                                    setValue={(value: string) => {
                                        setValue('english', value);
                                    }}
                                    setInfo={setInfo}
                                >
                                    <input
                                        {...register('english', { required: true })}
                                        className="w-full flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold placeholder:select-none"
                                        placeholder={errors.english?.type === 'required' ? '英単語は必須です' : ''}
                                        list="suggest"
                                    />
                                </DataList>
                            </div>
                            <div className="m-1 w-5/6 flex justify-between">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">訳:</span>
                                </label>
                                <textarea
                                    {...register('japanese', { required: true })}
                                    className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 resize-none text-center text-xl font-bold placeholder:select-none"
                                    rows={rows <= 10 ? rows : 10}
                                    placeholder={errors.japanese?.type === 'required' ? '訳は必須です' : ''}
                                ></textarea>
                            </div>
                            <div className="m-1 w-5/6 flex justify-between">
                                <label className="w-20 text-center">
                                    <span className="font-bold text-lg select-none">注釈:</span>
                                </label>
                                <input
                                    {...register('annotation')}
                                    className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold"
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
                                                            };
                                                        },
                                                        group: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                // fontWeight: 200,
                                                                fontSize: '1.1rem',
                                                            };
                                                        },
                                                        groupHeading: (baseStyles) => {
                                                            return { ...baseStyles, fontWeight: 700 };
                                                        },
                                                        valueContainer: (baseStyles) => {
                                                            return {
                                                                ...baseStyles,
                                                                textAlign: 'center',
                                                                fontSize: '1.2rem',
                                                                fontWeight: 700,
                                                                userSelect: 'none',
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
