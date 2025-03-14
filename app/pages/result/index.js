Page({
  data: {
    planData: null,
    showCalculationDetails: false,
    weekDays: ["日", "一", "二", "三", "四", "五", "六"],
    calendarDays: [],
  },

  onLoad: function (options) {
    const that = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on("acceptPlanData", function (data) {
      console.log("接收到的计划数据：", data)
      const planData = that.processPlanData(data)
      if (planData) {
        that.setData({ planData })
        that.generateCalendar(data.startDate, data.cyclePattern)
      } else {
        wx.showToast({
          title: "数据处理失败",
          icon: "none",
        })
      }
    })
  },

  processPlanData: function (data) {
    if (!data) {
      console.error("未接收到计划数据")
      return null
    }

    try {
      // 处理基础数据
      const stats = {
        bmr: Math.round(data.stats.bmr),
        tdee: Math.round(data.stats.tdee),
        calorieDeficit: Math.round(data.stats.calorieDeficit),
        dailyCalories: Math.round(data.stats.dailyCalories),
      }

      // 处理计算详情
      const calculationDetails = {
        bmrFormula: data.calculationDetails.bmrFormula,
        tdeeFormula: data.calculationDetails.tdeeFormula,
        dailyCaloriesFormula: data.calculationDetails.dailyCaloriesFormula,
        highCarbFormula: data.calculationDetails.highCarbFormula,
        lowCarbFormula: data.calculationDetails.lowCarbFormula,
      }

      // 处理循环信息
      const cycleInfo = {
        lowCarbDaysCount: data.lowCarbDaysCount,
        highCarbDaysCount: data.highCarbDaysCount,
        pattern: Array.isArray(data.cyclePattern)
          ? data.cyclePattern
          : data.cyclePattern.split(""),
        startDate: data.startDate,
      }

      // 处理每日计划
      const dailyPlans = {
        highCarbDay: this.processMacros(data.dailyPlans.highCarbDay),
        lowCarbDay: this.processMacros(data.dailyPlans.lowCarbDay),
      }

      return {
        stats,
        calculationDetails,
        cycleInfo,
        dailyPlans,
      }
    } catch (error) {
      console.error("处理计划数据时出错：", error)
      return null
    }
  },

  processMacros: function (plan) {
    if (!plan) return null

    return {
      calories: Math.round(plan.calories),
      protein: {
        grams: Math.round(plan.protein.grams),
        calories: Math.round(plan.protein.calories),
      },
      carbs: {
        grams: Math.round(plan.carbs.grams),
        calories: Math.round(plan.carbs.calories),
      },
      fat: {
        grams: Math.round(plan.fat.grams),
        calories: Math.round(plan.fat.calories),
      },
    }
  },

  formatMacroFormula: function (plan) {
    if (!plan) return ""

    return (
      `蛋白质${plan.protein.grams}g (${plan.protein.calories}千卡), ` +
      `碳水${plan.carbs.grams}g (${plan.carbs.calories}千卡), ` +
      `脂肪${plan.fat.grams}g (${plan.fat.calories}千卡)`
    )
  },

  generateCalendar: function (startDate, pattern) {
    if (!startDate || !pattern) {
      console.error("生成日历所需数据不完整")
      return
    }

    const patternArray = Array.isArray(pattern) ? pattern : pattern.split("")
    if (!patternArray.length) {
      console.error("循环模式数据无效")
      return
    }

    const today = new Date()
    const start = new Date(startDate)
    const calendarDays = []

    // 获取当月第一天是周几
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1)
    const firstDayWeek = firstDay.getDay()

    // 获取当月天数
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const totalDays = lastDay.getDate()

    // 填充前面的空白日期
    for (let i = 0; i < firstDayWeek; i++) {
      calendarDays.push({ day: "", type: "empty" })
    }

    // 填充日期
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = new Date(start.getFullYear(), start.getMonth(), i)
      const dayDiff =
        Math.floor((currentDate - start) / (1000 * 60 * 60 * 24)) + 1
      const isToday = currentDate.toDateString() === today.toDateString()
      const isStart = i === start.getDate()

      let type = ""
      if (dayDiff >= 0) {
        // 确保从开始日期算起是低碳日
        const adjustedDiff =
          dayDiff + (patternArray[0] === "H" ? patternArray.length - 1 : 0)
        const patternIndex = adjustedDiff % patternArray.length
        type = patternArray[patternIndex] === "H" ? "high-carb" : "low-carb"
      }

      calendarDays.push({
        day: i,
        type: type,
        isToday: isToday,
        isStart: isStart,
      })
    }

    this.setData({ calendarDays })
  },

  toggleCalculationDetails: function () {
    this.setData({
      showCalculationDetails: !this.data.showCalculationDetails,
    })
  },

  // 生成周计划文字
  generateWeekPlanText: function (startDate, pattern) {
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    const start = new Date(startDate)
    const weeks = []
    let currentWeek = []
    let dayCount = 0

    // 计算第一周开始前需要补充的天数
    const firstDayWeek = start.getDay()
    for (let i = 0; i < firstDayWeek; i++) {
      currentWeek.push("  ")
    }

    // 生成4周的计划
    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)

      // 调整pattern索引确保从低碳日开始
      const adjustedDay = i + (pattern[0] === "H" ? pattern.length - 1 : 0)
      const patternIndex = adjustedDay % pattern.length
      const dayType = pattern[patternIndex] === "H" ? "高" : "低"

      currentWeek.push(dayType)
      dayCount++

      // 一周结束或者达到28天
      if (currentDate.getDay() === 6 || i === 27) {
        // 补充本周剩余天数
        while (currentWeek.length < 7) {
          currentWeek.push("  ")
        }
        weeks.push([...currentWeek])
        currentWeek = []
      }
    }

    return weeks
  },

  copyPlan: function () {
    if (!this.data.planData) {
      wx.showToast({
        title: "计划数据不完整",
        icon: "none",
      })
      return
    }

    const plan = this.data.planData
    const calendarDays = this.data.calendarDays
    let text = `碳循环计划

基础数据：
- BMR：${plan.stats.bmr}千卡
- TDEE：${plan.stats.tdee}千卡
- 每日摄入：${plan.stats.dailyCalories}千卡

循环模式：${plan.cycleInfo.lowCarbDaysCount}低碳 + ${plan.cycleInfo.highCarbDaysCount}高碳
开始日期：${plan.cycleInfo.startDate} \n \n
`
    let lowcarbText = "低碳日："
    let highcarbText = "高碳日："

    for (let i = 0; i < calendarDays.length; i++) {
      if (calendarDays[i].type == "low-carb") {
        lowcarbText += `${calendarDays[i].day}号  `
      } else if (calendarDays[i].type == "high-carb") {
        highcarbText += `${calendarDays[i].day}号  `
      }
    }

    text += `${lowcarbText} \n`
    text += `${highcarbText} \n`

    text += `\n \n 高碳日营养素：
- 总热量：${plan.dailyPlans.highCarbDay.calories}千卡
- 蛋白质：${plan.dailyPlans.highCarbDay.protein.grams}g (${plan.dailyPlans.highCarbDay.protein.calories}千卡)
- 碳水：${plan.dailyPlans.highCarbDay.carbs.grams}g (${plan.dailyPlans.highCarbDay.carbs.calories}千卡)
- 脂肪：${plan.dailyPlans.highCarbDay.fat.grams}g (${plan.dailyPlans.highCarbDay.fat.calories}千卡)

低碳日营养素：
- 总热量：${plan.dailyPlans.lowCarbDay.calories}千卡
- 蛋白质：${plan.dailyPlans.lowCarbDay.protein.grams}g (${plan.dailyPlans.lowCarbDay.protein.calories}千卡)
- 碳水：${plan.dailyPlans.lowCarbDay.carbs.grams}g (${plan.dailyPlans.lowCarbDay.carbs.calories}千卡)
- 脂肪：${plan.dailyPlans.lowCarbDay.fat.grams}g (${plan.dailyPlans.lowCarbDay.fat.calories}千卡)`

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: "已复制到剪贴板",
          icon: "success",
        })
      },
    })
  },

  syncToCalendar: function () {
    if (!this.data.planData) {
      wx.showToast({
        title: "计划数据不完整",
        icon: "none",
      })
      return
    }

    wx.authorize({
      scope: "scope.writePhotosAlbum",
      success: () => {
        // 获取日历权限
        wx.addPhoneCalendar({
          title: "碳循环计划",
          description: "碳循环刷脂计划",
          startTime: this.data.planData.cycleInfo.startDate,
          allDay: true,
          success: () => {
            wx.showToast({
              title: "已同步到日历",
              icon: "success",
            })
          },
          fail: (err) => {
            wx.showToast({
              title: "同步失败",
              icon: "none",
            })
            console.error("同步日历失败：", err)
          },
        })
      },
      fail: () => {
        wx.showToast({
          title: "请授权日历权限",
          icon: "none",
        })
      },
    })
  },

  // 分享给朋友
  onShareAppMessage: function () {
    if (this.data.planData) {
      const plan = this.data.planData
      return {
        title: `我的碳循环刷脂计划：${plan.cycleInfo.lowCarbDaysCount}低+${plan.cycleInfo.highCarbDaysCount}高`,
        path: "/pages/welcome/index",
        imageUrl: "/images/share.png",
      }
    }
    return {
      title: "碳循环刷脂计划 - 科学减脂不反弹",
      path: "/pages/welcome/index",
      imageUrl: "/images/share.png",
    }
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    if (this.data.planData) {
      const plan = this.data.planData
      return {
        title: `我的碳循环刷脂计划：${plan.cycleInfo.lowCarbDaysCount}低+${plan.cycleInfo.highCarbDaysCount}高，BMR:${plan.stats.bmr}，TDEE:${plan.stats.tdee}`,
        query: "",
        imageUrl: "/images/share.png",
      }
    }
    return {
      title: "碳循环刷脂计划 - 科学减脂不反弹",
      query: "",
      imageUrl: "/images/share.png",
    }
  },
})
