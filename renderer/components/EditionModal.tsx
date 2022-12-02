import { Word } from './List/List';
import Modal from './Modal';
import RegisterForm from './RegisterForm';
import EditListItemProvider from './List/Providers/EditListItemProvider';

type Props = {
    word: Word;
    isShow: boolean;
    close: () => void;
};
const EditionModal: React.FC<Props> = ({ word, isShow, close }) => {
    console.log('editionModal');
    return (
        <>
            <Modal isShow={isShow} close={close}>
                <EditListItemProvider>
                    <RegisterForm word={word} close={close} />
                </EditListItemProvider>
            </Modal>
        </>
    );
};

export default EditionModal;
