<template>
    <div>
      <h1>Live Rooms</h1>
      <ul>
        <li v-for="room in rooms" :key="room.RoomID">
          <img :src="room.Cover" alt="Cover" />
          <h2>{{ room.Title }}</h2>
          <p>{{ room.UserName }}</p>
          <p>Online: {{ room.Online }}</p>
        </li>
      </ul>
      <button @click="loadMoreRooms" :disabled="!hasMore">Load More</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        category: {
          ID: 1,
        }, // 你需要根据实际情况定义这个对象
        page: 1,
        rooms: [],
        hasMore: true,
      };
    },
    methods: {
      async fetchRooms() {
        try {
          const response = await axios.get(`/api/cache.php`, {
            params: {
              m: 'LiveList',
              do: 'getLiveListByPage',
              tagAll: 0,
              // gameId: this.category.ID,
              page: this.page,
            }
          });
          const data = response.data;
          console.log(response);
          
          this.rooms.push(...this.parseData(data));
          this.hasMore = data.data.page < data.data.totalPage;
        } catch (error) {
          // console.error('Error fetching rooms:', error);
        }
      },
      parseData(data) {
        return data.data.datas.map(item => ({
          Cover: item.screenshot.includes('?') ? item.screenshot : `${item.screenshot}?x-oss-process=style/w338_h190&`,
          Online: parseInt(item.totalCount),
          RoomID: item.profileRoom,
          Title: item.introduction || item.roomName || '',
          UserName: item.nick,
        }));
      },
      loadMoreRooms() {
        this.page++;
        this.fetchRooms();
      },
    },
    mounted() {
      this.fetchRooms();
    },
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>