// test-content-structure.js - 内容结构测试
import { loadSearchIndex, loadNoteContent } from './js/data.js';

async function testContentStructure() {
    console.log('🧪 测试 HTML 文章唯一真源结构...');

    try {
        // 测试 1: 搜索索引加载
        const index = await loadSearchIndex();
        console.log('✅ 搜索索引加载成功，包含', index.items.length, '篇文章');

        // 测试 2: 验证所有文章都在 content/articles/ 下
        const allInContentArticles = index.items.every(item =>
            item.path.startsWith('content/articles/') && item.path.endsWith('.html')
        );
        if (!allInContentArticles) {
            throw new Error('搜索索引中仍然存在非 HTML 文章路径');
        }
        console.log('✅ 所有文章都在 content/articles/ 目录下:', allInContentArticles);

        // 测试 3: 验证路径格式正确
        index.items.forEach(item => {
            console.log(`📄 ${item.id}: ${item.path}`);
        });

        // 测试 4: 笔记内容加载测试
        const loadFailures = [];

        for (const item of index.items) {
            try {
                const content = await loadNoteContent(item.id);
                const body = content?.contentHtml || content?.content || '';
                if (body) {
                    console.log(`✅ ${item.id} 内容加载成功 (${body.length} 字符)`);
                } else {
                    loadFailures.push(`${item.id}: 空内容`);
                    console.log(`❌ ${item.id} 内容加载失败`);
                }
            } catch (error) {
                loadFailures.push(`${item.id}: ${error.message}`);
                console.log(`❌ ${item.id} 加载出错:`, error.message);
            }
        }

        if (loadFailures.length > 0) {
            throw new Error(`以下文章加载失败:\n${loadFailures.join('\n')}`);
        }

        // 测试 5: ID 到路径的映射一致性
        const idToPathMap = {};
        index.items.forEach(item => {
            idToPathMap[item.id] = item.path;
        });
        console.log('✅ ID到路径映射:', idToPathMap);

        console.log('🎉 HTML 文章唯一真源结构测试通过！');

    } catch (error) {
        console.error('❌ 内容结构测试失败:', error);
        console.error('错误详情:', error.stack);
        process.exitCode = 1;
    }
}

// 运行测试
testContentStructure();
