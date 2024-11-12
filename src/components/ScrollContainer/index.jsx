import React, { Component } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import './style.scss';

/**
 * ScrollContainer 组件 - 一个支持下拉刷新和上拉加载的容器组件
 *
 * 特点：
 * 1. 支持下拉刷新和上拉加载更多功能
 * 2. 使用 requestAnimationFrame 优化性能
 * 3. 流畅的动画效果和状态过渡
 * 4. 精确的触摸事件处理
 */
class ScrollContainer extends Component {
  // 定义默认属性
  static defaultProps = {
    hasMore: true, // 是否还有更多数据
    onRefresh: null, // 下拉刷新回调
    onLoadMore: null // 上拉加载回调
  };

  // 组件内部状态
  state = {
    startY: 0, // 触摸起始位置
    moveY: 0, // 当前触摸位置
    refreshHeight: 0, // 下拉刷新区域高度
    loadMoreHeight: 0, // 上拉加载区域高度
    isRefreshing: false, // 是否正在刷新
    isLoading: false, // 是否正在加载更多
    canRefresh: false, // 是否可以触发刷新
    canLoadMore: false, // 是否可以触发加载更多
    showLoadMore: false // 是否显示上拉加载区域
  };

  // 创建容器引用，用于获取滚动信息
  containerRef = React.createRef();
  // 用于 requestAnimationFrame 的 ID
  rafId = null;
  // 上一帧的时间戳，用于控制动画帧率
  lastFrameTime = 0;
  // 目标帧率 (60fps)
  FRAME_RATE = 1000 / 60;

  /**
   * 组件挂载时添加触摸事件监听
   * passive: false - 允许在 touchmove 中使用 preventDefault
   * passive: true - 优化滚动性能
   */
  componentDidMount() {
    const container = this.containerRef.current;
    if (container) {
      container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }
  }

  /**
   * 组件卸载时清理事件监听和动画
   */
  componentWillUnmount() {
    const container = this.containerRef.current;
    if (container) {
      container.removeEventListener('touchmove', this.handleTouchMove);
      container.removeEventListener('touchstart', this.handleTouchStart);
      container.removeEventListener('touchend', this.handleTouchEnd);
    }
    this.cancelAnimation();
  }

  /**
   * 取消正在进行的动画帧
   */
  cancelAnimation = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  /**
   * 更新下拉刷新区域高度
   * 使用 requestAnimationFrame 和帧率控制优化性能
   */
  updateRefreshHeight = height => {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.FRAME_RATE) {
      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(() => {
        this.setState({
          refreshHeight: height,
          canRefresh: height >= 60 // 下拉距离超过 60px 时可以触发刷新
        });
      });
    }
  };

  /**
   * 更新上拉加载区域高度
   * 同样使用 requestAnimationFrame 优化
   */
  updateLoadMoreHeight = height => {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.FRAME_RATE) {
      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(() => {
        this.setState({
          loadMoreHeight: height,
          canLoadMore: height >= 60 // 上拉距离超过 60px 时可以触发加载
        });
      });
    }
  };

  /**
   * 下拉刷新状态内容
   * 根据不同状态显示不同的提示文本和动画
   */
  get refreshStatusContent() {
    const { isRefreshing, canRefresh } = this.state;

    return (
      <div className="refresh-status-wrapper">
        {isRefreshing && (
          <div className="status-item refreshing">
            <LoadingSpinner size={16} />
            <span>正在刷新...</span>
          </div>
        )}
        {!isRefreshing && (
          <>
            <div className={`status-item pull ${canRefresh ? 'hide' : ''}`}>
              <span>下拉刷新</span>
            </div>
            <div className={`status-item release ${canRefresh ? '' : 'hide'}`}>
              <span>松手即可刷新</span>
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * 上拉加载状态内容
   * 根据不同状态显示不同的提示文本和动画
   */
  get loadingStatusContent() {
    const { isLoading, canLoadMore } = this.state;
    const { hasMore } = this.props;

    if (!hasMore) return '没有更多数据了';

    return (
      <div className="loading-status-wrapper">
        {isLoading && (
          <div className="status-item loading">
            <LoadingSpinner size={16} color="#999" />
            <span>正在加载...</span>
          </div>
        )}
        {!isLoading && hasMore && (
          <>
            <div className={`status-item pull ${canLoadMore ? 'hide' : ''}`}>
              <span>上拉加载</span>
            </div>
            <div className={`status-item release ${canLoadMore ? '' : 'hide'}`}>
              <span>松手即可加载</span>
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * 处理触摸开始事件
   * 记录初始触摸位置和重置状态
   */
  handleTouchStart = e => {
    const container = this.containerRef.current;
    if (!container) return;

    // 检查是否滚动到底部，用于判断是否可以上拉加载
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight > scrollHeight - 10;

    this.setState({
      startY: e.touches[0].clientY,
      moveY: e.touches[0].clientY,
      canRefresh: false,
      canLoadMore: false,
      isAtBottom,
      showLoadMore: false
    });
    this.lastFrameTime = Date.now();
  };

  /**
   * 处理触摸移动事件
   * 计算移动距离并更新UI状态
   *
   * 实现原理：
   * 1. 通过比较当前触摸位置和起始位置计算移动距离
   * 2. 根据容器的滚动位置判断是处于顶部还是底部
   * 3. 使用阻尼系数让拖动感觉更自然
   * 4. 使用 requestAnimationFrame 优化动画性能
   */
  handleTouchMove = e => {
    // 获取当前状态，如果正在刷新或加载则不处理
    const { startY, isRefreshing, isLoading } = this.state;
    const container = this.containerRef.current;
    if (!container || isRefreshing || isLoading) return;

    const currentY = e.touches[0].clientY;
    // 计算手指移动的距离
    const distance = currentY - startY;

    // 获取容器的滚动状态
    const { scrollTop, scrollHeight, clientHeight } = container;
    // 判断是否滚动到底部，预留 10px 的误差
    const isAtBottom = scrollTop + clientHeight > scrollHeight - 10;

    // 下拉刷新逻辑：
    // 1. distance > 0 表示下拉操作
    // 2. scrollTop === 0 确保在顶部才能下拉
    if (distance > 0 && scrollTop === 0) {
      // 阻止默认滚动行为，专注于下拉刷新
      e.preventDefault();
      // 使用 0.6 的阻尼系数让下拉感觉更自然，最大高度限制为 80px
      const refreshHeight = Math.min(distance * 0.6, 80);
      this.updateRefreshHeight(refreshHeight);
    }
    // 上拉加载逻辑：
    // 1. distance < 0 表示上拉操作
    // 2. isAtBottom 确保在底部才能上拉
    // 3. hasMore 确保还有更多数据可加载
    else if (distance < 0 && isAtBottom && this.props.hasMore) {
      e.preventDefault();
      // 同样使用 0.6 的阻尼系数，保持操作的一致性
      const loadMoreHeight = Math.min(Math.abs(distance) * 0.6, 80);
      this.updateLoadMoreHeight(loadMoreHeight);
      this.setState({
        canLoadMore: loadMoreHeight >= 60, // 上拉超过 60px 时可以触发加载
        showLoadMore: true // 显示上拉加载模块
      });
    }
  };

  /**
   * 滚动到底部
   * 在加载更多数据后自动滚动到新内容
   */
  scrollToBottom = () => {
    const container = this.containerRef.current;
    if (container) {
      const scrollHeight = container.scrollHeight;
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth' // 使用平滑滚动效果
      });
    }
  };

  /**
   * 处理触摸结束事件
   * 根据状态触发刷新或加载更多
   * 使用 async/await 处理异步操作
   *
   * 实现原理：
   * 1. 根据当前状态判断是触发刷新还是加载
   * 2. 使用 async/await 处理异步操作
   * 3. 在加载完成后自动滚动到新内容
   * 4. finally 中重置所有状态
   */
  handleTouchEnd = async () => {
    // 取消可能正在进行的动画
    this.cancelAnimation();
    const { isRefreshing, canRefresh, isLoading, canLoadMore } = this.state;
    const { onRefresh, onLoadMore } = this.props;

    // 下拉刷新条件：
    // 1. canRefresh 为 true（下拉距离足够）
    // 2. 当前没有在刷新
    // 3. 存在刷新回调函数
    if (canRefresh && !isRefreshing && onRefresh) {
      try {
        // 更新状态为刷新中
        this.setState({ isRefreshing: true, canRefresh: false });
        // 等待刷新完成
        await onRefresh();
      } finally {
        // 无论成功失败都重置状态
        this.resetState();
      }
    }
    // 上拉加载条件：
    // 1. canLoadMore 为 true（上拉距离足够）
    // 2. 当前没有在加载
    // 3. 存在加载回调函数
    else if (canLoadMore && !isLoading && onLoadMore) {
      try {
        // 更新状态为加载中
        this.setState({ isLoading: true, canLoadMore: false });
        // 等待加载完成
        await onLoadMore();
        // 使用 requestAnimationFrame 确保在 DOM 更新后再滚动
        requestAnimationFrame(() => {
          this.scrollToBottom(); // 滚动到新加载的内容
        });
      } finally {
        // 无论成功失败都重置状态
        this.resetState();
      }
    } else {
      // 如果没有触发刷新或加载，直接重置状态
      this.resetState();
    }
  };

  /**
   * 重置所有状态
   * 在刷新或加载完成后调用
   */
  resetState = () => {
    this.cancelAnimation();
    requestAnimationFrame(() => {
      this.setState({
        refreshHeight: 0,
        loadMoreHeight: 0,
        startY: 0,
        moveY: 0,
        isRefreshing: false,
        isLoading: false,
        canRefresh: false,
        canLoadMore: false,
        showLoadMore: false
      });
    });
  };

  /**
   * 渲染函数
   * 使用 transform 实现平滑的动画效果
   * 分别控制下拉和上拉区域的显示状态
   */
  render() {
    const {
      refreshHeight,
      loadMoreHeight,
      isRefreshing,
      isLoading,
      canRefresh,
      canLoadMore,
      showLoadMore
    } = this.state;
    const { children } = this.props;

    return (
      <div className="scroll-container-wrapper">
        <div ref={this.containerRef} className="scroll-container">
          <div
            className="scroll-content"
            style={{
              transform: `translate3d(0, ${refreshHeight - (showLoadMore ? loadMoreHeight : 0)}px, 0)`
            }}
          >
            <div
              className={`pull-down-refresh ${canRefresh ? 'can-refresh' : ''} ${
                isRefreshing ? 'refreshing' : ''
              }`}
            >
              {this.refreshStatusContent}
            </div>
            <div className="content-wrapper">{children}</div>
          </div>
        </div>
        <div
          className={`load-more ${canLoadMore ? 'can-load-more' : ''} ${
            isLoading ? 'loading' : ''
          } ${showLoadMore ? 'active' : ''}`}
          style={{
            position: 'absolute',
            transform: 'none',
            bottom: showLoadMore ? 0 : '-80px'
          }}
        >
          {this.loadingStatusContent}
        </div>
      </div>
    );
  }
}

export default ScrollContainer;
