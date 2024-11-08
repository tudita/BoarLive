import axios from 'axios'
import crypto from 'crypto'
import LiveSite from './live.js' // 假设 LiveSite 类在 live.js 文件中
import fs from 'fs'

class Huya extends LiveSite {
  constructor() {
    super()
    this._name = '虎牙直播'
  }

  get name() {
    return this._name
  }

  //getDanmaku() {
  //  // 实现 getDanmaku 方法
  //  return new HuyaDanmaku() // 假设 HuyaDanmaku 是一个已定义的类
  //}

  async getCategories() {
    const categories = [
      { ID: '1', Name: '网游' },
      { ID: '2', Name: '单机' },
      { ID: '8', Name: '娱乐' },
      { ID: '3', Name: '手游' }
    ]
    for (const item of categories) {
      item.Children = await this.getSubCategories(item.ID)
    }
    return categories
  }

  async getSubCategories(id) {
    const subs = []
    const result = await axios.get(
      `https://live.cdn.huya.com/liveconfig/game/bussLive?bussType=${id}`
    )
    const obj = result.data
    for (const item of obj.data) {
      subs.push({
        Pic: `https://huyaimg.msstatic.com/cdnimage/game/${item.gid}-MS.jpg`,
        ID: item.gid,
        ParentID: id,
        Name: item.gameFullName
      })
    }
    return subs
  }

  async getCategoryRooms(category, page = 1) {
    const categoryResult = { Rooms: [] }
    const result = await axios.get(
      `https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&tagAll=0&gameId=${category.ID}&page=${page}`
    )
    const obj = result.data
    for (const item of obj.data.datas) {
      let cover = item.screenshot
      if (!cover.includes('?')) {
        cover += '?x-oss-process=style/w338_h190&'
      }
      let title = item.introduction || item.roomName || ''
      categoryResult.Rooms.push({
        Cover: cover,
        Online: parseInt(item.totalCount),
        RoomID: item.profileRoom,
        Title: title,
        UserName: item.nick
      })
    }
    categoryResult.HasMore = parseInt(obj.data.page) < parseInt(obj.data.totalPage)
    return categoryResult
  }

  async getRecommendRooms(page = 1) {
    const categoryResult = { Rooms: [] }
    const result = await axios.get(
      `https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&tagAll=0&page=${page}`
    )
    const obj = result.data
    for (const item of obj.data.datas) {
      let cover = item.screenshot
      if (!cover.includes('?')) {
        cover += '?x-oss-process=style/w338_h190&'
      }
      let title = item.introduction || item.roomName || ''
      categoryResult.Rooms.push({
        Cover: cover,
        Online: parseInt(item.totalCount),
        RoomID: item.profileRoom,
        Title: title,
        UserName: item.nick
      })
    }
    categoryResult.HasMore = parseInt(obj.data.page) < parseInt(obj.data.totalPage)
    return categoryResult
  }

  async getRoomDetail(roomId) {
    const jsonObj = await this.getRoomInfo(roomId)

    const topSid = parseInt(jsonObj.topSid)
    const subSid = parseInt(jsonObj.subSid)

    let title = jsonObj.roomInfo.tLiveInfo.sIntroduction || jsonObj.roomInfo.tLiveInfo.sRoomName
    const uid = await this.getUid()
    const uuid = this.getUuid()
    const huyaLines = []
    const huyaBiterates = []

    const lines = jsonObj.roomInfo.tLiveInfo.tLiveStreamInfo.vStreamInfo.value
    for (const item of lines) {
      if (item.sFlvUrl) {
        huyaLines.push({
          Line: item.sFlvUrl,
          LineType: 'FLV',
          FlvAntiCode: item.sFlvAntiCode,
          HlsAntiCode: item.sHlsAntiCode,
          StreamName: item.sStreamName
        })
      }
    }

    huyaLines.sort((a, b) => (a.Line.includes('al.flv.') ? 1 : -1))

    const biterates = jsonObj.roomInfo.tLiveInfo.tLiveStreamInfo.vBitRateInfo.value
    for (const item of biterates) {
      huyaBiterates.push({
        BitRate: parseInt(item.iBitRate),
        Name: item.sDisplayName
      })
    }

    let realRoomId = parseInt(jsonObj.roomInfo.tLiveInfo.lProfileRoom)
    if (realRoomId === 0) {
      realRoomId = parseInt(jsonObj.roomInfo.tProfileInfo.lProfileRoom)
    }

    return {
      Cover: jsonObj.roomInfo.tLiveInfo.sScreenshot,
      Online: parseInt(jsonObj.roomInfo.tLiveInfo.lTotalCount),
      RoomID: realRoomId.toString(),
      Title: title,
      UserName: jsonObj.roomInfo.tProfileInfo.sNick,
      UserAvatar: jsonObj.roomInfo.tProfileInfo.sAvatar180,
      Introduction: jsonObj.roomInfo.tLiveInfo.sIntroduction,
      Notice: jsonObj.welcomeText,
      Status: parseInt(jsonObj.roomInfo.eLiveStatus) === 2,
      Data: {
        Url: 'https:' + Buffer.from(jsonObj.roomProfile.liveLineUrl, 'base64').toString('utf8'),
        Lines: huyaLines,
        BitRates: huyaBiterates,
        Uid: uid,
        UUid: uuid
      },
      DanmakuData: {
        Yyid: parseInt(jsonObj.roomInfo.tLiveInfo.lYyid),
        TopSid: topSid,
        SubSid: subSid
      },
      Url: `https://www.huya.com/${roomId}`
    }
  }

  async getRoomInfo(roomId) {
    const headers = {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/117.0.0.0'
    }
    const result = await axios.get(`https://m.huya.com/${roomId}`, { headers })
    let jsonStr = result.data.match(/window\.HNF_GLOBAL_INIT.=.\{[\s\S]*?\}[\s\S]*?<\/script>/)[0]
    jsonStr = jsonStr.replace(/window\.HNF_GLOBAL_INIT.=./, '').replace('</script>', '')
    jsonStr = jsonStr.replace(/function.*?\(.*?\).\{[\s\S]*?\}/g, '""')
    const jsonObj = JSON.parse(jsonStr)
    const topSid = parseInt(
      result.data.match(/lChannelId":([0-9]+)/)[0].replace('lChannelId":', '')
    )
    const subSid = parseInt(
      result.data.match(/lSubChannelId":([0-9]+)/)[0].replace('lSubChannelId":', '')
    )
    //const topSid = parseInt(result.data.match(/lChannelId":([0-9]+)/))
    //const subSid = parseInt(result.data.match(/lSubChannelId":([0-9]+)/)[1])

    jsonObj.topSid = topSid
    jsonObj.subSid = subSid
    //console.log(jsonObj)
    return jsonObj
  }

  getUuid() {
    return (
      ((Date.now() % 10000000000) * 1000 +
        1000 * Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) %
      0xffffffff
    )
  }

  async getUid() {
    const data = { appId: 5002, byPass: 3, context: '', version: '2.4', data: {} }
    //console.log(data)
    const result = await axios.post('https://udblgn.huya.com/web/anonymousLogin', data)
    const obj = result.data
    //console.log(obj)
    return obj.data.uid
  }

  async search(keyword, page = 1) {
    const searchResult = { Rooms: [] }
    try {
        const result = await axios.get(
            `https://search.cdn.huya.com/?m=Search&do=getSearchContent&q=${encodeURIComponent(
                keyword
            )}&uid=0&v=4&typ=-5&livestate=0&rows=20&start=${(page - 1) * 20}`
        )
        console.log(result)
        const obj = result.data
        for (const item of obj.response['3'].docs) {
            let cover = item.game_screenshot
            if (!cover.includes('?')) {
                cover += '?x-oss-process=style/w338_h190&'
            }
            searchResult.Rooms.push({
                Cover: cover,
                Online: parseInt(item.game_total_count),
                RoomID: item.room_id,
                Title: item.game_roomName,
                UserName: item.game_nick
            })
        }
        searchResult.HasMore = parseInt(obj.response['3'].numFound) > page * 20
    } catch (error) {
        console.error("搜索请求失败:", error)
        throw new Error("搜索请求失败，请稍后重试")
    }
    return searchResult
}

  async getPlayQuality(roomDetail) {
    const qualities = []
    const urlData = roomDetail.Data
    if (urlData.BitRates.length === 0) {
      urlData.BitRates = [
        { Name: '原画', BitRate: 0 },
        { Name: '高清', BitRate: 2000 }
      ]
    }

    for (const item of urlData.BitRates) {
      const urls = []
      for (const line of urlData.Lines) {
        let src = line.Line
        src += `/${line.StreamName}`
        if (line.LineType === 'FLV') {
          src += '.flv'
        }
        if (line.LineType === 'HLS') {
          src += '.m3u8'
        }

        const param = this.processAnticode(
          line.LineType === 'FLV' ? line.FlvAntiCode : line.HlsAntiCode,
          urlData.Uid,
          line.StreamName
        )

        src += `?${param}`

        if (item.BitRate > 0) {
          src = `${src}&ratio=${item.BitRate}`
        }
        urls.push(src)
      }
      qualities.push({ Data: urls, Quality: item.Name })
    }

    return qualities
  }

  processAnticode(anticode, uid, streamname) {
    const query = new URLSearchParams(anticode)
    query.set('t', '102')
    query.set('ctype', 'tars_mp')
    const wsTime = (Math.floor(Date.now() / 1000) + 21600).toString(16)
    const seqId = (Date.now() + parseInt(uid)).toString()
    const fm = Buffer.from(decodeURIComponent(query.get('fm')), 'base64').toString('utf8')
    const wsSecretPrefix = fm.split('_')[0]
    const wsSecretHash = crypto
      .createHash('md5')
      .update(`${seqId}|${query.get('ctype')}|${query.get('t')}`)
      .digest('hex')
    const wsSecret = crypto
      .createHash('md5')
      .update(`${wsSecretPrefix}_${uid}_${streamname}_${wsSecretHash}_${wsTime}`)
      .digest('hex')

    const map = new URLSearchParams()
    map.set('wsSecret', wsSecret)
    map.set('wsTime', wsTime)
    map.set('seqid', seqId)
    map.set('ctype', query.get('ctype'))
    map.set('ver', '1')
    map.set('fs', query.get('fs'))
    map.set('sphdcdn', query.get('sphdcdn') || '')
    map.set('sphdDC', query.get('sphdDC') || '')
    map.set('sphd', query.get('sphd') || '')
    map.set('exsphd', query.get('exsphd') || '')
    map.set('uid', uid)
    map.set('uuid', this.getUuid().toString())
    map.set('t', query.get('t'))
    map.set('sv', '2401310322')

    return map.toString()
  }

  async getPlayUrls(roomDetail, qn) {
    return qn.Data
  }

  async getLiveStatus(roomId) {
    const roomInfo = await this.getRoomInfo(roomId.toString())
    return parseInt(roomInfo.roomInfo.eLiveStatus) === 2
  }

  async getSuperChatMessages(roomId) {
    return []
  }
}
export default Huya
