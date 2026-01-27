// test-system.js - 系统集成测试
import { store } from './js/store.js';
import { loadNoteContent } from './js/data.js';

async function testSystem() {
    console.log('🧪 开始系统集成测试...');
    
    try {
        // 测试 1: 数据存储初始化
        await store.init();
        console.log('✅ 数据存储初始化成功');
        
        // 测试 2: 笔记列表
        const notes = store.getNotes();
        console.log(`✅ 加载 ${notes.length} 个笔记`);
        
        // 测试 3: 反向链接
        const backlinks = store.getBacklinks('react-hooks-best-practices');
        console.log(`✅ react-hooks-best-practices 有 ${backlinks.length} 个反向链接`);
        
        // 测试 4: 笔记内容加载
        const note = await loadNoteContent('tcp-handshake');
        if (note && note.linksOut) {
            console.log(`✅ tcp-handshake 有 ${note.linksOut.length} 个出链`);
        }
        
        // 测试 5: 搜索功能
        const searchResults = await store.searchNotes('TCP');
        console.log(`✅ 搜索 "TCP" 找到 ${searchResults.length} 个结果`);
        
        console.log('🎉 所有测试通过！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 运行测试
testSystem();
