/**
 * 弹出文件选择框并读取 Markdown 文本
 * @returns {Promise<string>} 返回文件内容的 Promise
 */
export async function readLocalMarkdown() {
  return new Promise((resolve, reject) => {
    // 1. 创建一个隐藏的 input 元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md'; // 限制只能选择 markdown 文件

    // 2. 监听文件选择事件
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject('未选择任何文件');
        return;
      }

      // 3. 使用 FileReader 读取文本内容
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result); // 这里就是 Markdown 的字符串内容
      };
      reader.onerror = (err) => reject('读取文件失败');
      
      reader.readAsText(file);
    };

    // 4. 触发点击，打开系统选择框
    input.click();
  });
}