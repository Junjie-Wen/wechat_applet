const Api = require('../../api/movie.js');
const app = getApp();

Page({
  data: {
    movieLineStatus: 0, // 0影院热映，1即将上映
    movieLine: [{},{},{},{},{},{}], // 院线
    movieComingI: [{},{},{},{},{},{}], // 即将上映
    movieTop250: [], // Top250
    currentPage: 0,
    isRefreshing: false,
    isLoading: false,
    isTop250FullLoaded: false
  },
  onLoad() {
    this.init();
    app.getMovieTop250All();
  },
  init() {
    const movieLineType = ['movieLine', 'movieComing'];
    this.getDataList(movieLineType[this.data.movieLineStatus], {
      city: app.globalData.city,
      start: 0,
      count: 9
    });
    this.getDataList('movieTop250', {
      start: 0,
      count: 10
    });
  },
  goToXinQinPage(){
    wx.navigateTo({
      url: '/pages/movie-Impressions/movie-Impressions',
    })
  },
  toSearchList(e) {
    wx.navigateTo({
      url: '/pages/search-list/search-list?input='+e.detail
    })
  },
  movieLineStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      movieLineStatus: status - 0
    });

    if (this.data.movieComing[0].title) return;
    this.getDataList('movieComing', {
      start: 0,
      count: 9
    });
  },
  getDataList(type, params) {
    const { isLoading, isTop250FullLoaded } = this.data;
    if (isLoading || isTop250FullLoaded) return;

    const type2Api = {
      movieLine: 'getMovieLine',
      movieComing: 'getMovieComing',
      movieTop250: 'getMovieTop250'
    };
    if (type === 'movieTop250') {
      this.setData({ isLoading: true });
    }

    Api[type2Api[type]](params)
    .then(res => {
      this.setData(type === 'movieTop250' ? {
        isTop250FullLoaded: res.subjects.length === 0,
        currentPage: this.data.currentPage+1,
        movieTop250: [...this.data.movieTop250, ...res.subjects]
      } : {
        [type]: res.subjects
      });

      wx.hideLoading();
      wx.stopPullDownRefresh();
      this.setData({ isLoading: false, isRefreshing: false });

    }).catch(err => {
      wx.showModal({
        title: '提示',
        content: `请求失败：${JSON.stringify(err)}`
      });
      wx.hideLoading();
      this.setData({ isLoading: false, isRefreshing: false });
    });
  },
  onPullDownRefresh() {
    this.setData({ 
      currentPage: 0, 
      isRefreshing: true, 
      movieTop250: [] 
    });
    wx.showLoading({ title: '正在加载...' });
    this.init();
  },
  onReachBottom() {
    this.getDataList('movieTop250', {
      start: this.data.currentPage*10,
      count: 10
    });
  },
  toDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id='+id
    })
  },
  toTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },
  onShareAppMessage() {
    return {
      title: `${app.globalData.appName}: 电影介绍、评分排行`,
      imageUrl: '/assets/images/share-img.jpg',
      path:`/pages/index/index`
    };
  }
})
