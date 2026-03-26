// js/app.js
// 注意：这里不再定义 libraryData，直接使用 data.js 中定义的变量

const app = {
    currentBook: null,
    fontSize: 18,
    isDarkMode: false,

    // 初始化函数
    init() {
        // 【重要调试】检查数据是否加载成功
        if (typeof libraryData === 'undefined') {
            console.error('❌ 严重错误：libraryData 未定义！请检查 index.html 中 script 标签顺序，data.js 必须在 app.js 之前。');
            alert('系统错误：图书数据加载失败，请检查控制台。');
            return;
        } else {
            console.log(`✅ 数据加载成功！共找到 ${libraryData.length} 本书。`);
        }

        this.loadSettings();
        this.renderLibrary(libraryData);
        this.setupEventListeners();
        this.applyTheme();
        
        // 初始化字体显示
        document.getElementById('fontSizeDisplay').innerText = `${this.fontSize}px`;
    },

    // 渲染书架
    renderLibrary(books) {
        const grid = document.getElementById('bookGrid');
        grid.innerHTML = ''; // 清空现有内容

        if (books.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">没有找到相关书籍</p>';
            return;
        }

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.onclick = () => this.openReader(book);
            
            // 创建卡片 HTML
            card.innerHTML = `
                <div class="book-cover" style="background: linear-gradient(135deg, ${book.color}, #333);">
                    <span>${book.icon}</span>
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // 打开阅读器
    openReader(book) {
        this.currentBook = book;
        
        // 填充内容
        document.getElementById('readerTitle').innerText = book.title;
        document.getElementById('readerMeta').innerText = `作者：${book.author}`;
        // 将章节数组合并为长文本
        document.getElementById('readerText').innerText = book.chapters.join('\n\n');
        
        // 显示模态框
        const modal = document.getElementById('readerModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 禁止背景滚动

        // 恢复上次阅读进度
        setTimeout(() => {
            const wrapper = document.querySelector('.reader-content-wrapper');
            const savedScroll = localStorage.getItem(`read_progress_${book.id}`);
            wrapper.scrollTop = savedScroll ? parseInt(savedScroll) : 0;
            this.updateProgress(); // 绑定进度条事件
        }, 100);
    },

    // 关闭阅读器
    closeReader() {
        const modal = document.getElementById('readerModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动

        // 保存阅读进度
        if (this.currentBook) {
            const scrollPos = document.querySelector('.reader-content-wrapper').scrollTop;
            localStorage.setItem(`read_progress_${this.currentBook.id}`, scrollPos);
        }
    },

    // 调整字体大小
    adjustFontSize(delta) {
        this.fontSize += delta;
        // 限制范围
        if (this.fontSize < 12) this.fontSize = 12;
        if (this.fontSize > 32) this.fontSize = 32;
        
        document.getElementById('readerText').style.fontSize = `${this.fontSize}px`;
        document.getElementById('fontSizeDisplay').innerText = `${this.fontSize}px`;
        
        // 保存字体偏好
        localStorage.setItem('user_fontSize', this.fontSize);
    },

    // 切换主题
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('user_theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
    },

    // 阅读器内切换主题
    toggleNightModeInReader() {
        this.toggleTheme();
    },

    // 应用主题样式
    applyTheme() {
        const theme = this.isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // 更新进度条
    updateProgress() {
        const wrapper = document.querySelector('.reader-content-wrapper');
        const progressBar = document.getElementById('progressBar');
        
        // 移除旧监听器防止叠加（简单处理：每次重新赋值）
        const newWrapper = wrapper.cloneNode(true);
        wrapper.parentNode.replaceChild(newWrapper, wrapper);
        
        newWrapper.addEventListener('scroll', () => {
            const totalHeight = newWrapper.scrollHeight - newWrapper.clientHeight;
            const progress = totalHeight > 0 ? (newWrapper.scrollTop / totalHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
            
            // 实时保存进度
            if (this.currentBook) {
                localStorage.setItem(`read_progress_${this.currentBook.id}`, newWrapper.scrollTop);
            }
        });
    },

    // 加载用户设置
    loadSettings() {
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
        }
        
        const savedFont = localStorage.getItem('user_fontSize');
        if (savedFont) {
            this.fontSize = parseInt(savedFont);
        }
    },

    // 绑定事件监听器
    setupEventListeners() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredBooks = libraryData.filter(book => 
                book.title.toLowerCase().includes(query) || 
                book.author.toLowerCase().includes(query)
            );
            this.renderLibrary(filteredBooks);
        });

        // 主题切换按钮
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // ESC 键关闭阅读器
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('readerModal');
                if (modal.style.display === 'flex') {
                    this.closeReader();
                }
            }
        });
    }
};

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});