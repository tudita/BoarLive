import axios from 'axios'
import LiveSite from './live.js'
import fs from 'fs'

class Douyin extends LiveSite {
  constructor() {
    super()
    this._name = '抖音直播'
    this.USER_AGENT =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0'
    this.REFERER = 'https://live.douyin.com'
    this.AUTHORITY = 'live.douyin.com'
    this.headers = {
      'User-Agent': this.USER_AGENT,
      Referer: this.REFERER,
      Authority: this.AUTHORITY,
      Cookie: 'asnxcujien8'
    }
  }
  //由于正常方式获取不到Cookie，所以这个地方我随便打了一串乱码当作Cookie,评价是有用。
  get name() {
    return this._name
  }

  async getRequestHeaders() {
    if (this.headers['Cookie']) {
      return this.headers
    }
    try {
      const resp = await axios.head('https://live.douyin.com', { headers: this.headers })
      resp.headers['set-cookie'].forEach((item) => {
        if (item.includes('ttwid')) {
          this.headers['Cookie'] = item.split(';')[0]
        }
      })
    } catch (ex) {
      console.error(ex.message)
    }
    return this.headers
  }

  async getCategories() {
    const categories = []
    const resp = await axios.get('https://live.douyin.com/', {
      headers: await this.getRequestHeaders()
    })
    const regex = /\{\\\"pathname\\\":\\\"\/\\\",\\\"categoryData.*?\]\\n/
    const match = regex.exec(resp.data)
    let renderData = match ? match[0] : ''
    if (!renderData) {
      throw new Error('无法读取分类数据')
    }
    renderData = renderData.trim().replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(']\\n', '')
    const renderDataJson = JSON.parse(renderData)
    renderDataJson.categoryData.forEach((item) => {
      const subs = []
      const id = `${item.partition.id_str},${item.partition.type}`
      item.sub_partition.forEach((subItem) => {
        subs.push({
          ID: `${subItem.partition.id_str},${subItem.partition.type}`,
          Name: subItem.partition.title,
          ParentID: id,
          Pic: ''
        })
      })
      const category = {
        Children: subs,
        ID: id,
        Name: item.partition.title
      }
      subs.unshift({ ID: category.ID, Name: category.Name, ParentID: category.ID, Pic: '' })
      categories.push(category)
    })
    return categories
  }

  async getCategoryRooms(category, page = 1) {
    const [partitionId, partitionType] = category.ID.split(',')
    const resp = await axios.get('https://live.douyin.com/webcast/web/partition/detail/room/', {
      headers: await this.getRequestHeaders(),
      params: {
        aid: '6383',
        app_name: 'douyin_web',
        live_id: '1',
        device_platform: 'web',
        count: '15',
        offset: (page - 1) * 15,
        partition: partitionId,
        partition_type: partitionType,
        req_from: '2'
      }
    })
    const json = resp.data
    const hasMore = json.data.data.length >= 15
    const items = json.data.data.map((item) => ({
      RoomID: item.web_rid,
      Title: item.room.title,
      Cover: item.room.cover.url_list[0],
      UserName: item.room.owner.nickname,
      Online: item.room.room_view_stats?.display_value ?? 0
    }))
    return { HasMore: hasMore, Rooms: items }
  }

  async getRecommendRooms(page = 1) {
    const resp = await axios.get('https://live.douyin.com/webcast/web/partition/detail/room/', {
      headers: await this.getRequestHeaders(),
      params: {
        aid: '6383',
        app_name: 'douyin_web',
        live_id: '1',
        device_platform: 'web',
        count: '40',
        offset: ((page - 1) * 15).toString(),
        partition: '720',
        partition_type: '1'
      }
    })
    fs.writeFile('output.json', JSON.stringify(resp.data, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file', err)
      } else {
        console.log('Successfully wrote to file')
      }
    })
    const json = resp.data
    const hasMore = json.data.data.length >= 15
    const items = json.data.data.map((item) => ({
      RoomID: item.web_rid,
      Title: item.room.title,
      Cover: item.room.cover.url_list[0],
      UserName: item.room.owner.nickname,
      Online: item.room.room_view_stats?.display_value ?? 0
    }))
    return { HasMore: hasMore, Rooms: items }
  }

  async getRoomDetail(roomId) {
    if (roomId.toString().length <= 16) {
      return await this.getRoomDetailByWebRid(roomId)
    }
    return await this.getRoomDetailByRoomID(roomId)
  }

  async getRoomDetailByRoomID(roomId) {
    const roomData = await this.getRoomDataByRoomID(roomId)
    const webRid = roomData.data.room.owner.web_rid
    const userUniqueId = this.generateRandomNumber(12).toString()
    const room = roomData.data.room
    const owner = room.owner
    const status = room.status
    if (status === 4) {
      return await this.getRoomDetailByWebRid(webRid)
    }
    const roomStatus = status === 2
    const headers = await this.getRequestHeaders()
    return {
      RoomID: webRid,
      Title: room.title,
      Cover: roomStatus ? room.cover.url_list[0] : '',
      UserName: owner.nickname,
      UserAvatar: owner.avatar_thumb.url_list[0],
      Online: roomStatus ? (room.room_view_stats?.display_value ?? 0) : 0,
      Status: roomStatus,
      Url: `https://live.douyin.com/${webRid}`,
      Introduction: owner?.signature ?? '',
      Notice: '',
      DanmakuData: {
        WebRid: webRid,
        RoomId: roomId,
        UserId: userUniqueId,
        Cookie: headers['Cookie']
      },
      Data: roomStatus ? room.stream_url : null
    }
  }

  async getRoomDetailByWebRid(webRid) {
    try {
      return await this.getRoomDetailByWebRidApi(webRid)
    } catch (ex) {
      console.error(ex.message)
    }
    return await this.getRoomDetailByWebRidHtml(webRid)
  }

  async getRoomDetailByWebRidApi(webRid) {
    const data = await this.getRoomDataApi(webRid)
    const roomData = data.data[0]
    const userData = data.user
    const roomId = roomData.id_str
    const userUniqueId = this.generateRandomNumber(12).toString()
    const owner = roomData.owner
    const roomStatus = roomData.status === 2
    const headers = await this.getRequestHeaders()
    return {
      RoomID: webRid,
      Title: roomData.title,
      Cover: roomStatus ? roomData.cover.url_list[0] : '',
      UserName: roomStatus ? owner.nickname : userData.nickname,
      UserAvatar: roomStatus ? owner.avatar_thumb.url_list[0] : userData.avatar_thumb.url_list[0],
      Online: roomStatus ? (roomData.room_view_stats?.display_value ?? 0) : 0,
      Status: roomStatus,
      Url: `https://live.douyin.com/${webRid}`,
      Introduction: owner?.signature ?? '',
      Notice: '',
      DanmakuData: {
        WebRid: webRid,
        RoomId: roomId,
        UserId: userUniqueId,
        Cookie: headers['Cookie']
      },
      Data: roomStatus ? roomData.stream_url : null
    }
  }

  async getRoomDetailByWebRidHtml(webRid) {
    const roomData = await this.getRoomDataHtml(webRid)

    const roomId = roomData.state.roomStore.roomInfo.room.id_str
    const userUniqueId = roomData.state.userStore.odin.user_unique_id
    const room = roomData.state.roomStore.roomInfo.room
    const owner = room.owner
    const anchor = roomData.state.roomStore.roomInfo.anchor
    const roomStatus = room.status === 2
    const headers = await this.getRequestHeaders()
    return {
      RoomID: webRid,
      Title: room.title,
      Cover: roomStatus ? room.cover.url_list[0] : '',
      UserName: roomStatus ? owner.nickname : anchor.nickname,
      UserAvatar: roomStatus ? owner.avatar_thumb.url_list[0] : anchor.avatar_thumb.url_list[0],
      Online: roomStatus ? (room.room_view_stats?.display_value ?? 0) : 0,
      Status: roomStatus,
      Url: `https://live.douyin.com/${webRid}`,
      Introduction: owner?.signature ?? '',
      Notice: '',
      DanmakuData: {
        WebRid: webRid,
        RoomId: roomId,
        UserId: userUniqueId,
        Cookie: headers['Cookie']
      },
      Data: roomStatus ? room.stream_url : null
    }
  }

  async getWebCookie(webRid) {
    const resp = await axios.head(`https://live.douyin.com/${webRid}`, {
      headers: await this.getRequestHeaders()
    })
    let dyCookie = ''
    resp.headers['set-cookie'].forEach((item) => {
      const cookie = item.split(';')[0]
      if (cookie.includes('ttwid') || cookie.includes('__ac_nonce') || cookie.includes('msToken')) {
        dyCookie += `${cookie};`
      }
    })
    return dyCookie
  }

  async getUserUniqueId(webRid) {
    const webInfo = await this.getRoomDataHtml(webRid)
    return webInfo.userStore.odin.user_unique_id
  }

  async getRoomDataHtml(webRid) {
    const dyCookie = await this.getWebCookie(webRid)
    const resp = await axios.get(`https://live.douyin.com/${webRid}`, {
      headers: {
        'User-Agent': this.USER_AGENT,
        Referer: this.REFERER,
        Authority: this.AUTHORITY,
        Cookie: dyCookie
      }
    })
    const regex = /\{\\\"state\\\":\{\\\"isLiveModal.*?\]\\n/
    const match = regex.exec(resp.data)
    let json = match ? match[0] : ''
    if (!json) {
      throw new Error('无法读取直播间数据')
    }
    json = json.trim().replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(']\\n', '')
    return JSON.parse(json)
  }

  async getRoomDataApi(webRid) {
    const resp = await axios.get('https://live.douyin.com/webcast/room/web/enter/', {
      headers: await this.getRequestHeaders(),
      params: {
        aid: '6383',
        app_name: 'douyin_web',
        live_id: '1',
        device_platform: 'web',
        enter_from: 'web_live',
        web_rid: webRid,
        room_id_str: '',
        enter_source: '',
        'Room-Enter-User-Login-Ab': '0',
        is_need_double_stream: 'false',
        cookie_enabled: 'true',
        screen_width: '1980',
        screen_height: '1080',
        browser_language: 'zh-CN',
        browser_platform: 'Win32',
        browser_name: 'Edge',
        browser_version: '125.0.0.0'
      }
    })
    return resp.data
  }

  async getRoomDataByRoomID(roomId) {
    const resp = await axios.get('https://webcast.amemv.com/webcast/room/reflow/info/', {
      headers: await this.getRequestHeaders(),
      params: {
        type_id: '0',
        live_id: '1',
        room_id: roomId,
        sec_user_id: '',
        version_code: '99.99.99',
        app_id: '6383'
      }
    })
    return resp.data
  }

  async getPlayQuality(roomDetail) {
    const qualities = []
    if (!roomDetail.Data) {
      return qualities
    }
    const data = roomDetail.Data
    const qualityList = data.live_core_sdk_data.pull_data.options.qualities
    const streamData = data.live_core_sdk_data.pull_data.stream_data
    if (!streamData.startsWith('{')) {
      const flvList = Object.values(data.flv_pull_url)
      const hlsList = Object.values(data.hls_pull_url_map)
      qualityList.forEach((quality) => {
        const level = quality.level
        const urls = []
        const flvIndex = flvList.length - level
        if (flvIndex >= 0 && flvIndex < flvList.length) {
          urls.push(flvList[flvIndex])
        }
        const hlsIndex = hlsList.length - level
        if (hlsIndex >= 0 && hlsIndex < hlsList.length) {
          urls.push(hlsList[hlsIndex])
        }
        if (urls.length > 0) {
          qualities.push({ Quality: quality.name, Sort: level, Data: urls })
        }
      })
    } else {
      const qualityData = JSON.parse(streamData).data
      qualityList.forEach((quality) => {
        const urls = []
        const flvUrl = qualityData[quality.sdk_key]?.main?.flv
        if (flvUrl) {
          urls.push(flvUrl)
        }
        const hlsUrl = qualityData[quality.sdk_key]?.main?.hls
        if (hlsUrl) {
          urls.push(hlsUrl)
        }
        if (urls.length > 0) {
          qualities.push({ Quality: quality.name, Sort: quality.level, Data: urls })
        }
      })
    }
    qualities.sort((a, b) => b.Sort - a.Sort)
    return qualities
  }

  async getPlayUrls(roomDetail, qn) {
    return qn.Data
  }

  async search(keyword, page = 1) {
    const query = {
      device_platform: 'webapp',
      aid: '6383',
      channel: 'channel_pc_web',
      search_channel: 'aweme_live',
      keyword,
      search_source: 'switch_tab',
      query_correct_type: '1',
      is_filter_search: '0',
      from_group_id: '',
      offset: (page - 1) * 20,
      count: '20',
      pc_client_type: '1',
      version_code: '170400',
      version_name: '17.4.0',
      cookie_enabled: 'true',
      screen_width: '1980',
      screen_height: '1080',
      browser_language: 'zh-CN',
      browser_platform: 'Win32',
      browser_name: 'Edge',
      browser_version: '125.0.0.0',
      browser_online: 'true',
      engine_name: 'Blink',
      engine_version: '125.0.0.0',
      os_name: 'Windows',
      os_version: '10',
      cpu_core_num: '12',
      device_memory: '8',
      platform: 'PC',
      downlink: '10',
      effective_type: '4g',
      round_trip_time: '100',
      webid: '7382872326016435738'
    }
    const requestUrl = `https://www.douyin.com/aweme/v1/web/live/search/?${new URLSearchParams(query).toString()}`
    const cookie = (await this.getRequestHeaders())['Cookie']
    const headers = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      cookie,
      priority: 'u=1, i',
      referer: `https://www.douyin.com/search/${encodeURIComponent(keyword)}?type=live`,
      'sec-ch-ua': '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': this.USER_AGENT
    }
    const resp = await axios.get(requestUrl, { headers })
    const json = resp.data
    const items = json.data.map((item) => {
      const itemData = JSON.parse(item.lives.rawdata)
      return {
        RoomID: itemData.owner.web_rid,
        Title: itemData.title,
        Cover: itemData.cover.url_list[0],
        UserName: itemData.owner.nickname,
        Online: itemData.stats.total_user
      }
    })
    return { HasMore: items.length >= 10, Rooms: items }
  }

  async getLiveStatus(roomId) {
    const result = await this.getRoomDetail(roomId)
    return result.Status
  }

  async getSuperChatMessages(roomId) {
    return []
  }

  generateRandomNumber(length) {
    const random = Math.floor(Math.random() * 9) + 1
    return random.toString().padEnd(length, '0')
  }
}

export default Douyin
