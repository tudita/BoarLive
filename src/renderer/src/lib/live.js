class LiveSite {
  constructor() {
    if (this.constructor === LiveSite) {
      throw new Error('Cannot instantiate an interface.')
    }
  }

  get name() {
    throw new Error("Method 'name' must be implemented.")
  }
  //弹幕
  getDanmaku() {
    throw new Error("Method 'getDanmaku' must be implemented.")
  }
  //获取分类
  async getCategories() {
    throw new Error("Method 'getCategories' must be implemented.")
  }
  //搜索
  async search(keyword, page = 1) {
    throw new Error("Method 'search' must be implemented.")
  }
  //读取分类下直播
  async getCategoryRooms(category, page = 1) {
    throw new Error("Method 'getCategoryRooms' must be implemented.")
  }
  //读取推荐直播
  async getRecommendRooms(page = 1) {
    throw new Error("Method 'getRecommendRooms' must be implemented.")
  }
  //获取房间详情
  async getRoomDetail(roomId) {
    throw new Error("Method 'getRoomDetail' must be implemented.")
  }
  //获取房间清晰度
  async getPlayQuality(roomDetail) {
    throw new Error("Method 'getPlayQuality' must be implemented.")
  }
  //获取播放地址, qn为清晰度
  async getPlayUrls(roomDetail, qn) {
    throw new Error("Method 'getPlayUrls' must be implemented.")
  }
  //获取SC
  async getSuperChatMessages(roomId) {
    throw new Error("Method 'getSuperChatMessages' must be implemented.")
  }
  //获取直播状态
  async getLiveStatus(roomId) {
    throw new Error("Method 'getLiveStatus' must be implemented.")
  }
}

export default LiveSite
