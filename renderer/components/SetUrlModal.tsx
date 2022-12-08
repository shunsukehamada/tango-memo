import React, { useContext, useState } from 'react';
import Modal from './Modal';
import { setDirectoryContext } from './SideBar/Providers/DirectoryProvider';
import { ChildDirectory, DirectoryStructure } from './SideBar/SideBar';

type Props = {
    isShow: boolean;
    close: () => void;
    folder: ChildDirectory;
};

const SetUrlModal: React.FC<Props> = ({ isShow, close, folder }) => {
    const [value, setValue] = useState<string>('');
    const setDirectoryStructure = useContext(setDirectoryContext);
    return (
        <Modal isShow={isShow} close={close} h="25%" w={'40%'}>
            <div className="text-black h-full w-full">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        close();
                        const status = await global.ipcRenderer.invoke('set-url', folder, value);
                        if (status === 201) {
                            const allFolders = (await global.ipcRenderer.invoke(
                                'get-all-folders'
                            )) as DirectoryStructure[];
                            setDirectoryStructure(allFolders);
                        }
                    }}
                    className="flex flex-col justify-evenly h-full"
                >
                    <label className="mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold ml-2 inline-block">url:</span>
                            <input
                                type="text"
                                className="outline-none border-b-2 border-solid border-black text-lg w-full mx-3"
                                style={{ background: 'rgba(0,0,0,0)' }}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                }}
                            />
                        </div>
                    </label>
                    <div className="flex justify-center">
                        <button type="submit" className="border-2 border-solid border-black rounded px-3 py-1">
                            <span className="text-lg font-bold">登録</span>
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default SetUrlModal;
