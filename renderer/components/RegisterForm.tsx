import { Ref, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { RiPencilFill } from 'react-icons/ri';
import Select from 'react-select';
import { PoSsType } from '../pages/register';
import { Word } from './List/List';
import { editListItemContext } from './List/Providers/EditListItemProvider';
import { ChildDirectory, DirectoryStructure } from './SideBar/SideBar';

type Inputs = {
    english: string;
    japanese: string;
    annotation: string;
    folder: Folder;
    pos: PoSsType[];
};

type Folder = {
    label: string;
    value: ChildDirectory;
};

type Props = {
    word: Word;
    close: () => void;
};

const RegisterForm: React.FC<Props> = ({ word, close }) => {
    const editItems = useContext(editListItemContext);
    const [directoryStructureState, setDirectoryStructureState] = useState<DirectoryStructure[]>([]);
    const [defaultFolder, setDefaultFolder] = useState<Folder>();
    const [rows, setRows] = useState<number>(1);

    useEffect(() => {
        const getAllFolders = async () => {
            const allFolders = (await global.ipcRenderer.invoke('get-all-folders')) as DirectoryStructure[];
            setDirectoryStructureState(allFolders);
        };
        const getFolder = async () => {
            const folder = (await global.ipcRenderer.invoke('get-folder', word?.folder_id)) as Folder;
            setDefaultFolder(folder);
            setValue('folder', folder);
        };
        getAllFolders();
        getFolder();
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        setValue,
    } = useForm<Inputs>({
        mode: 'all',
        defaultValues: { ...word, pos: word?.poss as PoSsType[] },
    });
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        global.ipcRenderer.send('edit-word', data, word?.id);
        if (
            defaultFolder.value.parentId === data.folder.value.parentId &&
            defaultFolder.value.id === data.folder.value.id
        ) {
            editItems({ ...word, english: data.english, japanese: data.japanese, annotation: data.annotation });
        } else {
            editItems(word, true);
        }
        close();
    };

    const PoSs: Readonly<{ [pos in PoSsType]: string }> = {
        Noun: '???',
        Verb: '???',
        Adjective: '???',
        Adverb: '???',
        Conjunction: '???',
        Pronoun: '???',
        Preposition: '???',
        Interjection: '???',
    };

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

    const options = [...directoryStructureState].map((directory) => {
        return {
            label: directory.parent.name,
            options: [...directory.children].map((folder) => {
                return {
                    label: folder.name,
                    value: folder,
                };
            }),
        };
    });

    const formRef = useRef();
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const reactHookFormJapaneseRef = register('japanese').ref;
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
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="h-3/4 w-3/4 flex items-center flex-col justify-around text-black"
                ref={formRef}
            >
                <div className="m-1 w-5/6 flex justify-between">
                    <label className="w-20 text-center">
                        <div className="font-bold text-lg select-none whitespace-nowrap">?????????:</div>
                    </label>
                    <input
                        {...register('english', { required: true })}
                        className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold placeholder:select-none"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                        placeholder={errors.english?.type === 'required' ? '????????????????????????' : ''}
                    />
                </div>
                <div className="m-1 w-5/6 flex justify-between">
                    <label className="w-20 text-center">
                        <span className="font-bold text-lg select-none whitespace-nowrap">???:</span>
                    </label>
                    <textarea
                        {...register('japanese', { required: true })}
                        className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 resize-none text-center text-xl font-bold placeholder:select-none"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                        rows={rows <= 10 ? rows : 10}
                        placeholder={errors.japanese?.type === 'required' ? '??????????????????' : ''}
                        ref={useCombinedRefs(textAreaRef, reactHookFormJapaneseRef)}
                    ></textarea>
                </div>
                <div className="m-1 w-5/6 flex justify-between">
                    <label className="w-20 text-center">
                        <span className="font-bold text-lg select-none whitespace-nowrap">??????:</span>
                    </label>
                    <input
                        {...register('annotation')}
                        className="flex-1 border-b-2 border-gray-300 placeholder:font-bold placeholder:text-center focus:outline-0 focus:border-blue-500 text-center text-xl font-bold"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                    />
                </div>
                <div className="m-1 w-5/6 flex justify-between items-center">
                    <label className="w-20 text-center">
                        <span className="font-bold text-lg select-none whitespace-nowrap">????????????:</span>
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
                <div className="flex flex-wrap">
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
                    <span className="text-2xl select-none">??????</span>
                </div>
            </form>
        </>
    );
};

export default RegisterForm;
