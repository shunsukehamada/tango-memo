import { Word } from './List/List';
import Modal from './Modal';
import RegisterForm from './RegisterForm';

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
                <RegisterForm word={word} close={close} />
            </Modal>
        </>
    );
};

export default EditionModal;
