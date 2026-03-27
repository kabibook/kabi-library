// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        initHome();
    } else if (path.includes('reader.html')) {
        initReader();
    }
});

// --- 首页逻辑 ---
function initHome() {
    const grid = document.getElementById('book-grid');
    const searchInput = document.getElementById('search-input');

    // 渲染书籍列表
    function renderBooks(books) {
        if (books.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">没有找到相关书籍</div>';
            return;
        }
        grid.innerHTML = books.map(book => `
            <a href="reader.html?id=${book.id}" class="book-card">
                <div class="cover-wrapper">
                    <img src="${book.cover}" alt="${book.title}" class="book-cover">
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-desc">${book.description}</div>
                </div>
            </a>
        `).join('');
    }

    // 初始渲染
    renderBooks(libraryData);

    // 搜索监听
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const filtered = libraryData.filter(book => 
            book.title.toLowerCase().includes(keyword) || 
            book.author.toLowerCase().includes(keyword) ||
            book.description.toLowerCase().includes(keyword)
        );
        renderBooks(filtered);
    });
}

// --- 阅读器逻辑 ---
async function initReader() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const chapterIndex = parseInt(urlParams.get('chapter')) || 0;

    const book = libraryData.find(b => b.id === bookId);
    
    if (!book) {
        document.querySelector('.reader-layout').innerHTML = '<h2 style="text-align:center; margin-top:50px;">书籍未找到，请返回首页</h2>';
        return;
    }

    // 1. 渲染侧边栏目录
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = book.chapters.map((chap, index) => `
        <li>
            <a href="?id=${bookId}&chapter=${index}" 
               class="chapter-link ${index === chapterIndex ? 'active' : ''}">
               ${chap.title}
            </a>
        </li>
    `).join('');

    // 2. 设置页面标题
    document.title = `${book.chapters[chapterIndex].title} - ${book.title}`;
    document.getElementById('chapter-title').innerText = book.chapters[chapterIndex].title;
    document.getElementById('book-meta').innerText = `${book.title} / ${book.author}`;

    // 3. 加载章节内容
    const contentDiv = document.getElementById('chapter-content');
    contentDiv.innerText = "正在加载章节...";

    try {
        // 使用 fetch 读取 txt 文件
        const response = await fetch(book.chapters[chapterIndex].file);
        if (!response.ok) throw new Error('无法加载文本文件');
        const text = await response.text();
        contentDiv.innerText = text;
    } catch (error) {
        console.error(error);
        contentDiv.innerText = "内容加载失败。请确保你正在使用 Live Server 运行，且文件路径正确。";
    }

    // 4. 底部导航逻辑
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    // 上一章
    if (chapterIndex > 0) {
        prevBtn.disabled = false;
        prevBtn.onclick = () => window.location.href = `?id=${bookId}&chapter=${chapterIndex - 1}`;
    } else {
        prevBtn.disabled = true;
    }

    // 下一章
    if (chapterIndex < book.chapters.length - 1) {
        nextBtn.disabled = false;
        nextBtn.onclick = () => window.location.href = `?id=${bookId}&chapter=${chapterIndex + 1}`;
    } else {
        nextBtn.disabled = true;
        nextBtn.innerText = "已完本";
    }
}