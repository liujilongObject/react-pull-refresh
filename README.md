# React Pull Refresh

一个轻量级的 React 下拉刷新和上拉加载容器组件，专为移动端设计，提供流畅的交互体验。

[查看效果展示](https://react-pull-refresh.vercel.app/)

## 特性

- 🚀 轻量级，零外部依赖
- 💫 流畅的动画效果和状态过渡
- 🎯 精确的触摸响应和手势控制
- 📱 专为移动端优化
- 🎨 可自定义样式和主题
- 🔄 支持下拉刷新
- ⬆️ 支持上拉加载更多
- 📜 自动滚动到新加载内容
- 🎭 丰富的状态反馈
- ⚡️ 使用 RAF 优化性能

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/your-username/react-pull-refresh.git
cd react-pull-refresh
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

## 使用示例

```jsx
import ScrollContainer from './components/ScrollContainer';

function App() {
  const handleRefresh = async () => {
    // 处理下拉刷新
    const data = await fetchNewData();
    setList(data);
  };

  const handleLoadMore = async () => {
    // 处理上拉加载
    const newData = await fetchMoreData(page);
    setList(prev => [...prev, ...newData]);
  };

  return (
    <div style={{ height: '100vh' }}>
      <ScrollContainer
        hasMore={true}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
      >
        <YourListComponent data={list} />
      </ScrollContainer>
    </div>
  );
}
```

## 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| hasMore | boolean | true | 是否还有更多数据可加载 |
| onRefresh | () => Promise<void> | null | 下拉刷新的回调函数 |
| onLoadMore | () => Promise<void> | null | 上拉加载的回调函数 |
| children | ReactNode | - | 容器内容 |

## 使用注意

1. 容器样式
```jsx
// 确保父容器有固定高度
<div style={{ height: '100vh' }}>
  <ScrollContainer>
    {/* 内容 */}
  </ScrollContainer>
</div>
```

2. 异步处理
```jsx
// 正确处理异步加载状态
const handleLoadMore = async () => {
  try {
    const data = await fetchData();
    setList(prev => [...prev, ...data]);
  } catch (error) {
    // 错误处理
  }
};
```

3. 列表状态管理
```jsx
// 管理加载状态和数据
const [hasMore, setHasMore] = useState(true);
const [list, setList] = useState([]);

// 在数据加载完成后更新状态
const handleLoadMore = async () => {
  const data = await fetchData();
  setList(prev => [...prev, ...data]);
  setHasMore(data.length > 0);
};
```

## 自定义样式

组件使用 SCSS 模块化样式，你可以通过覆盖以下类名来自定义样式：

```scss
.scroll-container-wrapper {
  // 容器样式
  .pull-down-refresh {
    // 下拉刷新区域样式
  }
  
  .load-more {
    // 上拉加载区域样式
  }
}
```

## 项目结构

```
src/
  ├── components/
  │   └── ScrollContainer/
  │       ├── index.jsx        # 主组件
  │       ├── style.scss       # 组件样式
  ├── pages/
  │   └── Home/               # 示例页面
  └── styles/
      └── global.scss         # 全局样式
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 浏览器支持

- iOS Safari >= 9
- Android Chrome >= 50
- 其他现代浏览器

## License

MIT
