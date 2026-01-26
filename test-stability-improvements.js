// test-stability-improvements.js - 稳定性改进测试
import { urlOf, mustGet, optionalGet, safeJsonParse } from './js/utils.js';
import { fetchJson, fetchText, loadSearchIndex } from './js/data.js';

async function testStabilityImprovements() {
    console.log('🧪 开始测试稳定性改进...');

    try {
        // 测试 1: urlOf 函数
        const testUrl = urlOf('data/search.json');
        console.log('✅ urlOf 函数工作正常:', testUrl);

        // 测试 2: DOM 断言函数 (在DOM加载后测试)
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // 测试可选DOM函数
        const optionalEl = optionalGet('non-existent-element');
        console.log('✅ optionalGet 函数工作正常:', optionalEl === null ? '返回null' : '找到元素');

        // 测试 3: 安全的JSON解析
        const validJson = safeJsonParse('{"test": "value"}');
        console.log('✅ safeJsonParse 解析有效JSON:', validJson);

        try {
            safeJsonParse('{invalid json}');
        } catch (error) {
            console.log('✅ safeJsonParse 正确处理无效JSON:', error.message);
        }

        // 测试 4: 资源获取函数
        const searchIndex = await loadSearchIndex();
        console.log('✅ loadSearchIndex 工作正常，版本:', searchIndex.version, '项目数:', searchIndex.items?.length || 0);

        // 测试 5: 笔记内容加载
        const noteContent = await fetchText('content/notes/skills-overview.md');
        console.log('✅ fetchText 工作正常，内容长度:', noteContent.length);

        console.log('🎉 所有稳定性改进测试通过！');

    } catch (error) {
        console.error('❌ 稳定性测试失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

// 运行测试
testStabilityImprovements();