import React, { Component } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import './style.scss';

class ScrollContainer extends Component {
  static defaultProps = {
    hasMore: true,
    onRefresh: null,
    onLoadMore: null
  };

  state = {
    startY: 0,
    moveY: 0,
    refreshHeight: 0,
    loadMoreHeight: 0,
    isRefreshing: false,
    isLoading: false,
    canRefresh: false,
    canLoadMore: false,
    showLoadMore: false,
  };

  containerRef = React.createRef();
  rafId = null;
  lastFrameTime = 0;
  FRAME_RATE = 1000 / 60;

  componentDidMount() {
    const container = this.containerRef.current;
    if (container) {
      container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }
  }

  componentWillUnmount() {
    const container = this.containerRef.current;
    if (container) {
      container.removeEventListener('touchmove', this.handleTouchMove);
      container.removeEventListener('touchstart', this.handleTouchStart);
      container.removeEventListener('touchend', this.handleTouchEnd);
    }
    this.cancelAnimation();
  }

  cancelAnimation = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  updateRefreshHeight = (height) => {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.FRAME_RATE) {
      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(() => {
        this.setState({
          refreshHeight: height,
          canRefresh: height >= 60
        });
      });
    }
  };

  updateLoadMoreHeight = (height) => {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.FRAME_RATE) {
      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(() => {
        this.setState({
          loadMoreHeight: height,
          canLoadMore: height >= 60
        });
      });
    }
  };

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

  handleTouchStart = (e) => {
    const container = this.containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = (scrollTop + clientHeight) > scrollHeight - 10;

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

  handleTouchMove = (e) => {
    const { startY, isRefreshing, isLoading } = this.state;
    const container = this.containerRef.current;
    if (!container || isRefreshing || isLoading) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = (scrollTop + clientHeight) > scrollHeight - 10;

    if (distance > 0 && scrollTop === 0) {
      e.preventDefault();
      const refreshHeight = Math.min(distance * 0.6, 80);
      this.updateRefreshHeight(refreshHeight);
    } else if (distance < 0 && isAtBottom && this.props.hasMore) {
      e.preventDefault();
      const loadMoreHeight = Math.min(Math.abs(distance) * 0.6, 80);
      this.updateLoadMoreHeight(loadMoreHeight);
      this.setState({
        canLoadMore: loadMoreHeight >= 60,
        showLoadMore: true
      });
    }
  };

  scrollToBottom = () => {
    const container = this.containerRef.current;
    if (container) {
      const scrollHeight = container.scrollHeight;
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  handleTouchEnd = async () => {
    this.cancelAnimation();
    const { isRefreshing, canRefresh, isLoading, canLoadMore } = this.state;
    const { onRefresh, onLoadMore } = this.props;

    if (canRefresh && !isRefreshing && onRefresh) {
      try {
        this.setState({ isRefreshing: true, canRefresh: false });
        await onRefresh();
      } finally {
        this.resetState();
      }
    } else if (canLoadMore && !isLoading && onLoadMore) {
      try {
        this.setState({ isLoading: true, canLoadMore: false });
        await onLoadMore();
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      } finally {
        this.resetState();
      }
    } else {
      this.resetState();
    }
  };

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
        <div
          ref={this.containerRef}
          className="scroll-container"
        >
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
            <div className="content-wrapper">
              {children}
            </div>
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