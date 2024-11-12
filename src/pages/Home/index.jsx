import React, { Component } from 'react';
import ScrollContainer from '../../components/ScrollContainer';
import './style.scss';

class Home extends Component {
  state = {
    list: [],
    hasMore: true,
    page: 1
  };

  componentDidMount() {
    this.loadInitialData();
  }

  loadInitialData = async () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `项目 ${i + 1}`
    }));

    this.setState({ list: mockData });
  };

  handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.loadInitialData();
    this.setState({ page: 1, hasMore: true });
    console.log('%c 【下拉刷新完成】', 'color: red;font-size: 20px;');
  };

  handleLoadMore = async () => {
    const { page, list } = this.state;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newData = Array.from({ length: 10 }, (_, i) => ({
      id: list.length + i + 1,
      title: `项目 ${list.length + i + 1}`
    }));

    this.setState(prevState => ({
      list: [...prevState.list, ...newData],
      page: prevState.page + 1,
      hasMore: page < 5
    }));
    console.log('%c 【上拉加载完成】', 'color: green;font-size: 20px;');
  };

  render() {
    const { list, hasMore } = this.state;

    return (
      <div className="home-container">
        <ScrollContainer
          hasMore={hasMore}
          onRefresh={this.handleRefresh}
          onLoadMore={this.handleLoadMore}
        >
          <div className="list">
            {list.map(item => (
              <div key={item.id} className="list-item">
                {item.title}
              </div>
            ))}
          </div>
        </ScrollContainer>
      </div>
    );
  }
}

export default Home; 