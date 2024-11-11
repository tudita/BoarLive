import axios from 'axios'
import LiveSite from './live.js'
import crypto from 'crypto'
import fs from 'fs'

class Bilibili extends LiveSite {
  constructor() {
    super()
    this._name = '哔哩哔哩直播'
    this.Cookie =
      'A8999F03-AFEE-C660-CCC8-1A89E51E3F9957628-024081012-rOY58dQ8skMNENxWKOnY8NnX7QSau8v4UKF2rVKLASTxohWX%2FMKY4Doj7XVKzPfK'
    this.UserId = 2143576020
    // this.Cookie = null
    // this.UserId = null
  }

  get name() {
    return this._name
  }

  // getDanmaku() {
  //   // 实现 getDanmaku 方法
  //   return new BilibiliDanmaku(); // 假设 BilibiliDanmaku 是一个已定义的类
  // }

  async getCategories() {
    const categories = []
    const result = await axios.get(
      'http://api.live.bilibili.com/room/v1/Area/getList',
      { need_entrance: 1, parent_id: 0 },
      this.getRequestHeader()
    )
    const obj = result.data
    for (const item of obj.data) {
      const subs = []
      for (const subItem of item.list) {
        subs.push({
          Pic: subItem.pic + '@100w.png',
          ID: subItem.id,
          ParentID: subItem.parent_id,
          Name: subItem.name
        })
      }
      categories.push({
        Children: subs,
        ID: item.id,
        Name: item.name
      })
    }

    return categories
  }

  async getCategoryRooms(category, page = 1) {
    const categoryResult = { Rooms: [] }
    const result = await axios.get(
      `https://api.live.bilibili.com/xlive/web-interface/v1/second/getList`,
      {
        platform: 'web',
        parent_area_id: category.ParentID,
        area_id: category.ID,
        page: page,
        sort_type: 'online'
      },
      this.getRequestHeader()
    )
    console.log(result)
    const obj = result.data
    console.log(obj)
    categoryResult.HasMore = parseInt(obj.data.has_more) === 1
    //categoryResult.HasMore = rooms.length === pagesize
    for (const item of obj.data.list) {
      categoryResult.Rooms.push({
        Cover: item.cover + '@300w.jpg',
        Online: parseInt(item.online),
        RoomID: item.roomid,
        Title: item.title,
        UserName: item.uname
      })
    }
    return categoryResult
  }

  async getRecommendRooms(page = 1) {
    const categoryResult = { Rooms: [] }
    const result = await axios.get(
      `https://api.live.bilibili.com/room/v1/Area/getListByAreaID`,
      {
        areaId: 0,
        sort: 'online',
        pageSize: 30,
        page: page
      },
      this.getRequestHeader()
    )
    const obj = result.data
    //?
    categoryResult.HasMore = obj.data.length > 0
    for (const item of obj.data) {
      categoryResult.Rooms.push({
        Cover: item.cover + '@300w.jpg',
        Online: parseInt(item.online),
        RoomID: item.roomid,
        Title: item.title,
        UserName: item.uname
      })
    }

    return categoryResult
  }

  async getRoomDetail(roomId) {
    const query = await this.getWbiSign(`room_id=${roomId}`)
    const result = await axios.get(
      `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?${query}`,
      this.getRequestHeader()
    )
    //console.log('Room details:', JSON.stringify(result, null, 2))
    //console.log(result)
    const obj = result.data
    //console.log(obj)
    return {
      Cover: obj.data.room_info.cover,
      Online: parseInt(obj.data.room_info.online),
      RoomID: obj.data.room_info.room_id,
      Title: obj.data.room_info.title,
      UserName: obj.data.anchor_info.base_info.uname,
      Introduction: obj.data.room_info.description,
      UserAvatar: obj.data.anchor_info.base_info.face + '@100w.jpg',
      Notice: '',
      Status: parseInt(obj.data.room_info.live_status) === 1,
      DanmakuData: {
        RoomId: parseInt(obj.data.room_info.room_id),
        UserId: this.UserId,
        Cookie: this.Cookie
      },
      Url: `https://live.bilibili.com/${roomId}`
    }
  }

  async search(keyword, page = 1) {
    const searchResult = { Rooms: [] }
    const url = 'https://api.bilibili.com/x/web-interface/search/type'
    const params = {
      search_type: 'live',
      keyword: keyword,
      order: 'totalrank',
      duration: '0',
      tids: '0',
      page: '1'
    }
    const headers = {
      Cookie: 'SESSDATA=xxx'
    }
    const result = await axios.get(url, { params, headers })
    const obj = result.data
    for (const item of obj.data.result.live_room) {
      searchResult.Rooms.push({
        Cover: `https:${item.cover}@300w.jpg`,
        Online: parseInt(item.online),
        RoomID: item.roomid,
        Title: item.title.replace(/<em.*?\/em>/g, ''),
        UserName: item.uname
      })
    }
    searchResult.HasMore = searchResult.Rooms.length > 0
    return searchResult
  }

  async getPlayQuality(roomDetail) {
    if (!this.Cookie) {
      return this.getPlayQualityOld(roomDetail.RoomID)
    } else {
      return this.getPlayQualityNew(roomDetail.RoomID)
    }
  }

  async getPlayUrls(roomDetail, qn) {
    //console.log('Room ID:', roomDetail.RoomID)
    //console.log('QN.data:', qn.Data)
    if (!this.Cookie) {
      return this.getPlayUrlsOld(roomDetail.RoomID, qn.Data)
    } else {
      return this.getPlayUrlsNew(roomDetail.RoomID, qn.Data)
    }
  }

  async getLiveStatus(roomId) {
    const result = await axios.get(
      `https://api.live.bilibili.com/room/v1/Room/get_info`,
      { room_id: roomId },
      this.getRequestHeader()
    )
    const obj = result.data
    return obj.data.live_status === 1
  }

  async getSuperChatMessages(roomId) {
    // const result = await axios.get(
    //   `https://api.live.bilibili.com/av/v1/SuperChat/getMessageList`,
    //   { room_id: roomId },
    //   this.getRequestHeader()
    // )
    // const obj = result.data
    // const list = obj.data.list.map((item) => ({
    //   BackgroundBottomColor: item.background_bottom_color,
    //   BackgroundColor: item.background_color,
    //   EndTime: Utils.timestampToDateTime(item.end_time),
    //   StartTime: Utils.timestampToDateTime(item.start_time),
    //   Face: `${item.user_info.face}@200w.jpg`,
    //   Message: item.message,
    //   Price: item.price,
    //   UserName: item.user_info.uname
    // }))
    // return list
    return []
  }

  getRequestHeader(withBuvid3 = false) {
    if (!this.Cookie) {
      const headers = {}
      if (withBuvid3) {
        //headers.push('cookie', 'buvid3=infoc;')
        headers.cookie = 'buvid3=infoc;'
      }
      return headers
    } else {
      return { cookie: this.Cookie }
    }
  }

  async getPlayQualityOld(roomID) {
    const qualities = []
    const result = await axios.get(
      `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${roomID}&qn=&platform=web`,
      {
        headers: this.getRequestHeader()
      }
      // this.get //?
    )
    console.log('Old result:', result)
    const obj = result.data
    console.log('Old obj: ', obj)
    for (const item of obj.data.quality_description) {
      qualities.push({
        Quality: item.desc,
        Data: parseInt(item.qn)
      })
    }

    return qualities
  }

  async getPlayQualityNew(roomID) {
    const qualities = []
    const result = await axios.get(
      `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo`,
      {
        params: {
          room_id: roomID,
          protocol: '0,1',
          format: '0,1,2',
          codec: '0,1',
          platform: 'web'
        },
        headers: this.getRequestHeader()
      }
    )
    console.log('new result: ', result)
    const obj = result.data
    console.log('new obj:', obj)
    const qualitiesMap = new Map()
    for (const item of obj.data.playurl_info.playurl.g_qn_desc) {
      qualitiesMap.set(parseInt(item.qn), item.desc)
    }
    for (const item of obj.data.playurl_info.playurl.stream[0].format[0].codec[0].accept_qn) {
      qualities.push({
        Quality: qualitiesMap[parseInt(item.qn)] || '未知清晰度',
        Data: item
      })
    }

    return qualities
  }

  async getPlayUrlsOld(roomID, qn) {
    const urls = []
    //console.log('Room ID:', roomID)
    //console.log('QN:', qn)
    const result = await axios.get(
      `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${roomID}&qn=${qn}&platform=web`,
      {
        headers: this.getRequestHeader()
      }
    )
    //console.log('API Response:', result)
    const obj = result.data
    //console.log(obj)
    for (const item of obj.data.durl) {
      urls.push(item.url)
    }

    return urls
  }

  async getPlayUrlsNew(roomID, qn) {
    //const urls = []
    const result = await axios.get(
      `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo`,
      {
        params: {
          room_id: roomID,
          protocol: '0,1',
          format: '0,2',
          codec: '0',
          platform: 'web',
          qn: qn
        },
        headers: this.getRequestHeader()
      }
    )
    console.log('API Response:', result)
    const urls = result.data.data.playurl_info.playurl.stream.flatMap((streamItem) =>
      streamItem.format.flatMap((formatItem) =>
        formatItem.codec.flatMap((codecItem) =>
          codecItem.url_info.map(
            (urlItem) => `${urlItem.host}${codecItem.base_url}${urlItem.extra}`
          )
        )
      )
    )
    return urls
  }

  async getWbiSign(query) {
    const result = await this.getWbiKeys()
    const imgKey = result[0]
    const subKey = result[1]
    const mixinKey = this.getMixinKey(imgKey + subKey)
    const currentTime = Math.round(new Date().getTime() / 1000)
    const queryString = new URLSearchParams(query)
    const queryParams = Object.fromEntries(queryString)
    const orderedParams = Object.keys(queryParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = queryParams[key].replace(/!|'|\(|\)|\*/g, '')
        return acc
      }, {})
    const queryStr = Object.entries(orderedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    const wbiSign = crypto.createHash('md5').update(`${queryStr}${mixinKey}`).digest('hex')
    return `${queryStr}&w_rid=${wbiSign}`
  }

  getMixinKey(origin) {
    const mixinKeyEncTab = new Uint8Array([
      46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29,
      28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22,
      25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
    ])
    return Array.from(origin)
      .map((char, index) => char.charCodeAt(0))
      .reduce((acc, charCode, index) => {
        return acc + String.fromCharCode(charCode ^ mixinKeyEncTab[index % mixinKeyEncTab.length])
      }, '')
  }

  async getWbiKeys() {
    if (this._imgKey && this._subKey) {
      return [this._imgKey, this._subKey]
    }
    const response = await axios.get(
      'http://api.bilibili.com/x/web-interface/nav',
      this.getRequestHeader()
    )
    const obj = response.data
    const imgUrl = obj.data.wbi_img.img_url
    const subUrl = obj.data.wbi_img.sub_url
    this._imgKey = imgUrl.split('/').pop().split('.')[0]
    this._subKey = subUrl.split('/').pop().split('.')[0]
    return [this._imgKey, this._subKey]
  }
}

export default Bilibili
