import React, { ReactNode, useEffect, useState } from 'react';
import SideBar from './SideBar';
import List, { Word } from './List';
import { resetServerContext } from 'react-beautiful-dnd';

type Props = {
    children: ReactNode;
    title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
    const words: Word[] = [];

    // build時は削除
    const [winReady, setWinReady] = useState(false);
    useEffect(() => {
        setWinReady(true);
    }, []);

    const dummy = [
        { english: 'provide', japanese: '提供する, 与える' },
        { english: 'merchant', japanese: '商人' },
        { english: 'needle', japanese: '針' },
        { english: 'fasten', japanese: '(ベルトなどを)締める' },
        { english: 'mental', japanese: '心(精神)の' },
        { english: 'object', japanese: '目的, 物体反対する' },
        { english: 'produce', japanese: '生産する, 制作する生産物' },
        { english: 'progress', japanese: '進展, 進歩する' },
        { english: 'finished', japanese: '仕上がった, 終わった' },
        { english: 'oxygen', japanese: '酸素' },
        { english: 'alive', japanese: '生きている' },
        { english: 'own', japanese: '所有する' },
        { english: 'recommend', japanese: '推薦する' },
        { english: 'diplomacy', japanese: '外交' },
        { english: 'rainfall', japanese: '降雨' },
        { english: 'rise', japanese: '上がる, 生じる' },
        { english: 'admirable', japanese: '賞賛に値する' },
        { english: 'structure', japanese: '構造, 枠組み' },
        { english: 'upstairs', japanese: '階上, 階上へ' },
        { english: 'observatory', japanese: '観測所, 天文台、気象台' },
        { english: 'herbivore', japanese: '草食動物' },
        { english: 'exercise', japanese: '練習[問題], 体操運動する、鍛える' },
        { english: 'lava', japanese: '溶岩' },
        { english: 'territory', japanese: '領地, 地域' },
        { english: 'imagine', japanese: '想像する' },
        { english: 'usage', japanese: '使用法' },
        { english: 'grain', japanese: '穀物, (砂などの)粒、木目' },
        { english: 'adopt', japanese: '採用する' },
        { english: 'investment', japanese: '投資' },
        { english: 'proposal', japanese: '申し入れ' },
        { english: 'tool', japanese: '道具, ツール' },
        { english: 'vibration', japanese: '振動' },
        { english: 'aptitude', japanese: '才能, 適性' },
        { english: 'incessant', japanese: '絶え間ない, ひっきりなしの' },
        { english: 'moat', japanese: '堀' },
        { english: 'checkered', japanese: '波瀾万丈の, 変化に富んだ' },
        { english: 'animosity', japanese: '惜しみ, 敵意' },
        { english: 'innocuous', japanese: '無害の' },
        { english: 'exonerate', japanese: '免除する, 解放する' },
        { english: 'climactic', japanese: '最高潮の' },
        { english: 'disputatious', japanese: '論争好きな' },
        { english: 'fitful', japanese: '断続的な, 気まぐれの' },
        { english: 'protract', japanese: '長引かせる' },
        { english: 'pinnacle', japanese: '(the~)頂点, 高峰' },
        { english: 'sniff', japanese: '鼻でクンクン嗅ぐ' },
        { english: 'apex', japanese: '頂点' },
        { english: 'senile', japanese: 'ぼけた, 老齢による' },
        { english: 'lenient', japanese: '寛大な, 情け深い' },
        { english: 'mow', japanese: '(草などを)刈る' },
        { english: 'flee', japanese: '(迫害などから)逃れる' },
        { english: 'intoxicate', japanese: '酔わせる, 夢中にさせる, 興奮させる, 中毒にする' },
        { english: 'suppleness', japanese: 'しなやかさ, 柔軟性' },
        { english: 'plethora', japanese: '過多' },
        {
            english: 'caricature',
            japanese:
                '風刺漫画, 風刺画, 風刺する, ⒈他のことにかこつけるなどして，社会や人物のあり方を批判的嘲笑的に言い表すこと。',
        },
    ];
    for (let i = 0; i < dummy.length; i++) {
        words.push({ id: i, ...dummy[i] });
    }
    return (
        <div className="flex">
            <SideBar
                directoryStructure={[
                    { parent: 'folder1', children: ['folder1-1', 'folder1-2'] },
                    {
                        parent: 'folder2',
                        children: ['folder2-1', 'folder2-2', 'folder2-3'],
                    },
                ]}
            />
            <div className="flex-1">{winReady && <List items={words} />}</div>
            {/* <div className="flex-1">
                <List items={words} />
            </div> */}
        </div>
    );
};

export default Layout;
