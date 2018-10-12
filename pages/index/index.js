const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data: {
    nowTemp: "14°",
    nowWeather: "晴天",
    nowWeatherBackground: '',
    hourlyWeather: []
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.getNow()
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '湘潭市'
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result);
        this.setHourlyWeather(result);
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow(result) {
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    });
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: weatherColorMap[weather],
      animation: {
        duration: 500,
        timingFunc: 'easeOut'
      }
    });
  },
  setHourlyWeather(result) {
    let hourlyWeather = [];
    let nowHour = new Date().getHours();
    let forecast = result.forecast;
    for (let i = 0; i < 8; i ++) {
      hourlyWeather.push({
        time: (i*3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    };
    hourlyWeather[0].time = "现在";
    this.setData({
      hourlyWeather: hourlyWeather
    })
  }
})