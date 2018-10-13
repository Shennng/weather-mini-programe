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

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0  //未弹窗提示
const UNAUTHORIZED = 1  //被拒绝
const AUTHORIZED = 2  //已允许


Page({
  data: {
    nowTemp: "14°",
    nowWeather: "晴天",
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp:'',
    todayDate:'',
    city:'北京市',
    locationAuthType: UNPROMPTED,
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'DL5BZ-YH5RV-WBQP3-UGY4N-DK2ZK-MXFDL'
    });
    wx.getSetting({
      success: res => {
        let auth = res.authSetting["scope.userLocation"];
        this.setData({
          locationAuthType: (
            auth? AUTHORIZED : (auth===false)? UNAUTHORIZED : UNPROMPTED)
          })
        if (auth) {
          this.getCityAndWeather();
        } else {
          this.getNow();
        }
        }
    });
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result);
        this.setHourlyWeather(result);
        this.setToday(result);
        console.log(result);
      },
      fail: res => {
        console.log("天气数据获取失败" + res);
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
  },
  setToday(result) {
    let date = new Date();
    this.setData({
      todayTemp:`${result.today.minTemp}° 
      - ${result.today.maxTemp}°`,
      todayDate:`${date.getFullYear()}
      -${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: "/pages/list/list?city=" + this.data.city
    })
  },
  onTapLocation() {
    this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
        });
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city;
            this.setData({
              city: city,
            });
            console.log(city);
            this.getNow();
          },
        });
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})