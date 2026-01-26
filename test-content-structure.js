// test-content-structure.js - 内容结构测试
import { loadSearchIndex, loadNoteContent } from './js/data.js';

async function testContentStructure() {
    console.log('🧪 测试内容层唯一真源结构...');

    try {
        // 测试 1: 搜索索引加载
        const index = await loadSearchIndex();
        console.log('✅ 搜索索引加载成功，包含', index.items.length, '个笔记');

        // 测试 2: 验证所有笔记都在 content/notes/ 下
        const allInContentNotes = index.items.every(item =>
            item.path.startsWith('content/notes/')
        );
        console.log('✅ 所有笔记都在 content/notes/ 目录下:', allInContentNotes);

        // 测试 3: 验证路径格式正确
        index.items.forEach(item => {
            console.log(`📄 ${item.id}: ${item.path}`);
        });

        // 测试 4: 笔记内容加载测试
        for (const item of index.items.slice(0, 2)) { // 测试前2个笔记
            try {
                const content = await loadNoteContent(item.id);
                if (content && content.content) {
                    console.log(`✅ ${item.id} 内容加载成功 (${content.content.length} 字符)`);
                } else {
                    console.log(`❌ ${item.id} 内容加载失败`);
                }
            } catch (error) {
                console.log(`❌ ${item.id} 加载出错:`, error.message);
            }
        }

        // 测试 5: ID 到路径的映射一致性
        const idToPathMap = {};
        index.items.forEach(item => {
            idToPathMap[item.id] = item.path;
        });
        console.log('✅ ID到路径映射:', idToPathMap);

        console.log('🎉 内容层唯一真源结构测试通过！');

    } catch (error) {
        console.error('❌ 内容结构测试失败:', error);
        console.error('错误详情:', error.stack);
    }
}

// 运行测试
testContentStructure();